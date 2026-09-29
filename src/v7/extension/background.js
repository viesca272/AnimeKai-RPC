importScripts("sites.js", "playback.js");

const HOST = "com.animekai.discordrpc";
const VERSION = "7.0.0-alpha.1";
const PUBLISHER_CLIENT_ID = "1543575455523807385";
const PLAYER_SCRIPT_ID = "anime-rpc-v7-player-frames";
const CONTENT_FILES = ["sites.js", "adapters/animekai.js", "adapters/animepahe.js", "adapters/nineanime.js", "playback.js", "content.js"];
const ARTWORK_ROOT = "https://github.com/viesca272/AnimeKai-RPC/releases/download/v7.0.0-alpha.1";
const SETUP_URL = "https://github.com/viesca272/AnimeKai-RPC/releases/tag/v7.0.0-alpha.1";
const DEFAULTS = {
  enabled: true,
  enabledSites: { animekai: true, animepahe: false, nineanime: false },
  client_id: PUBLISHER_CLIENT_ID,
  playbackMode: "auto",
  showTimestamp: true,
  detailsTemplate: "{anime}",
  stateTemplate: "Episode {episode} / {total} • {status}",
  accent: "#8b5cf6",
  background: "#0c0b12",
  cardBackground: "#16131d",
  backgroundGradient: "linear-gradient(145deg,#0c0b12 0%,#1b1029 58%,#25143b 100%)",
  cardGradient: "linear-gradient(145deg,rgba(31,22,43,.96),rgba(18,15,27,.96))",
  preset: "animekai",
  theme: "dark",
  compact: false,
  reducedMotion: false
};

let settings = {...DEFAULTS};
let port = null;
let publisher = {};
let current = null;
let lastActivitySig = "";
let lastActivitySentAt = 0;
const lastArtworkResolve = new Map();
const pages = new Map();
let activeTabId = null;
let selectedTabId = null;
let activitySuppressed = false;
let refreshTimer = null;

const state = {
  version: VERSION,
  nativeConnected: false,
  discordConnected: false,
  hostVersion: null,
  helperChannel: null,
  helperProtocol: null,
  rpcVariant: null,
  rpcLastUpdate: null,
  lastUpdate: null,
  lastRefresh: null,
  lastError: null,
  current: null,
  repair: null,
  settings,
  playerAccess: false,
  sites: AnimeRPCSites.sites,
  setupUrl: SETUP_URL
};

let accessSync = Promise.resolve();
function syncPlayerAccess() {
  accessSync = accessSync.catch(() => {}).then(async () => {
    try {
      state.playerAccess = await chrome.permissions.contains({ origins: ["<all_urls>"] });
      const registered = await chrome.scripting.getRegisteredContentScripts();
      const old = registered.filter(script => [PLAYER_SCRIPT_ID, "animekai-rpc-player-frames"].includes(script.id));
      if (old.length) await chrome.scripting.unregisterContentScripts({ ids: old.map(script => script.id) });
      if (state.playerAccess) {
        await chrome.scripting.registerContentScripts([{
          id: PLAYER_SCRIPT_ID, matches: ["<all_urls>"], js: CONTENT_FILES,
          runAt: "document_start", allFrames: true, matchOriginAsFallback: true
        }]);
      }
    } catch (error) { state.lastError = `Player access setup: ${error.message}`; }
    if (!state.playerAccess) {
      for (const page of pages.values()) for (const id of page.frames.keys()) if (id !== 0) page.frames.delete(id);
      selectCurrent();
    }
    broadcast();
  });
  return accessSync;
}

async function init() {
  try {
    const r = await fetch(chrome.runtime.getURL("publisher.json"));
    if (r.ok) publisher = await r.json();
  } catch {}
  const stored = await chrome.storage.local.get(DEFAULTS);
  settings = {...DEFAULTS, ...stored};
  settings.client_id = String(publisher.discord_application_id || PUBLISHER_CLIENT_ID).trim();
  await chrome.storage.local.set({client_id: settings.client_id});
  settings.enabledSites = {...DEFAULTS.enabledSites, ...stored.enabledSites};
  state.settings = settings;
  await syncPlayerAccess();
  connectNative();
  await refreshTabs();
}

function broadcast() {
  state.current = current;
  state.settings = settings;
  state.setupUrl = publisher.v7_release_url || SETUP_URL;
  chrome.runtime.sendMessage({type:"v7State", state}).catch(()=>{});
}

function nativeConfig() {
  return {
    client_id: settings.client_id || PUBLISHER_CLIENT_ID,
    playbackMode: settings.playbackMode,
    showTimestamp: settings.showTimestamp,
    detailsTemplate: settings.detailsTemplate,
    stateTemplate: settings.stateTemplate
  };
}

function connectNative() {
  if (port) return true;
  try {
    port = chrome.runtime.connectNative(HOST);
    state.nativeConnected = true;
    state.lastError = null;
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(() => {
      state.nativeConnected = false;
      state.discordConnected = false;
      state.lastError = chrome.runtime.lastError?.message || "Desktop helper disconnected";
      port = null;
      broadcast();
    });
    port.postMessage({type:"config", config:nativeConfig()});
    broadcast();
    return true;
  } catch (e) {
    state.nativeConnected = false;
    state.lastError = e.message;
    port = null;
    broadcast();
    return false;
  }
}

function onNativeMessage(msg) {
  if (msg?.type === "status") {
    state.discordConnected = !!msg.discordConnected;
    state.hostVersion = msg.hostVersion || state.hostVersion;
    state.helperChannel = msg.helperChannel || state.helperChannel;
    state.helperProtocol = msg.protocolVersion || state.helperProtocol;
    state.rpcVariant = msg.rpcVariant || state.rpcVariant;
    state.rpcLastUpdate = msg.rpcLastUpdate || state.rpcLastUpdate;
    state.lastError = msg.lastError || msg.error || null;
    if (msg.artworkRejected && current?.kind !== "browsing" && current?.title) resolveAlternateCover(current.title, current.image, true);
  } else if (msg?.type === "health") {
    state.repair = {kind:"health", pending:false, ...msg};
  } else if (msg?.type === "repairResult") {
    state.repair = {kind:"repair", ...msg};
  } else if (msg?.type === "error") {
    state.lastError = msg.error || "Desktop helper error";
  }
  broadcast();
}

function sendNative(message) {
  if (!connectNative()) return false;
  try { port.postMessage(message); return true; }
  catch (e) { state.lastError = e.message; return false; }
}

async function refreshNow() {
  state.lastRefresh = Date.now();
  state.lastError = null;
  await syncPlayerAccess();
  connectNative();
  sendNative({type:"config", config:nativeConfig()});
  sendNative({type:"refresh"});

  activitySuppressed = false;
  await refreshTabs();

  lastActivitySig = "";
  lastActivitySentAt = 0;
  if (current && settings.enabled && !activitySuppressed) sendActivity(true);
  broadcast();
}

async function refreshTabs() {
  const tabs = await chrome.tabs.query({url: AnimeRPCSites.patterns});
  await Promise.allSettled(tabs.map(async tab => {
    if (tab.id == null || !enabledSite(tab.url)) return;
    if (tab.active) activeTabId = tab.id;
    try { await chrome.tabs.sendMessage(tab.id, {type:"forceRefresh"}); }
    catch { await chrome.scripting.executeScript({target:{tabId:tab.id, allFrames:state.playerAccess}, files:CONTENT_FILES}); }
  }));
}

function enabledSite(url) {
  const site = AnimeRPCSites.match(url);
  return site && settings.enabled && settings.enabledSites[site.id] ? site : null;
}

function selectCurrent() {
  const now = Date.now();
  const candidates = [];
  for (const [tabId, page] of pages) {
    if (!page.top || !enabledSite(page.top.url)) continue;
    const frames = [...page.frames.values()].filter(frame => now - frame.receivedAt < 20000);
    const best = frames.map(frame => frame.media).filter(Boolean).sort((a,b) => AnimeRPCPlayback.rank(b) - AnimeRPCPlayback.rank(a))[0];
    const candidate = {...page.top, image: page.cover?.title === page.top.title ? page.cover.url : page.top.image, tabId, found:!!best?.found,
      state:page.top.kind === "browsing" ? "browsing" : best?.state || "waiting",
      position:best?.position || 0, duration:best?.duration || 0};
    delete candidate.media;
    delete candidate.playerFrames;
    if (candidate.kind === "browsing") candidate.image = `${ARTWORK_ROOT}/${candidate.siteId}-512.png`;
    candidates.push(candidate);
  }
  const previous = current;
  current = AnimeRPCPlayback.selectTab(candidates, selectedTabId, activeTabId);
  selectedTabId = current?.tabId ?? null;
  if (!current) {
    if (previous) sendNative({type:"clear"});
    lastActivitySig = "";
  } else {
    if (current.kind === "watching" && !current.image) resolveAlternateCover(current.title);
    sendActivity();
  }
  broadcast();
}

function cleanMedia(media = {}) {
  const states = ["playing", "paused", "buffering", "ended", "waiting"];
  const finite = value => Number.isFinite(value) && value >= 0 ? value : 0;
  return {found:media.found === true, state:states.includes(media.state) ? media.state : "waiting",
    position:finite(media.position), duration:finite(media.duration)};
}

async function acceptFrame(sender, data) {
  const tabId = sender.tab?.id;
  const site = enabledSite(sender.tab?.url);
  if (tabId == null || !site || !data || typeof data !== "object") return;
  if (sender.frameId === 0) {
    if (data.role !== "top" || data.url !== sender.url || AnimeRPCSites.match(data.url)?.id !== site.id) return;
    const page = pages.get(tabId) || {top:null, frames:new Map()};
    if (page.top?.url !== data.url || page.documentId !== sender.documentId) page.frames.clear();
    if (page.top?.url !== data.url || page.top?.title !== data.title) page.cover = null;
    page.documentId = sender.documentId;
    const safeText = value => typeof value === "string" ? value.slice(0,256) : "";
    page.top = {url:data.url, siteId:site.id, siteName:site.name, siteHome:site.home,
      kind:data.kind === "watching" ? "watching" : "browsing", title:safeText(data.title) || site.name,
      episode:AnimeRPCSites.number(data.episode), total:AnimeRPCSites.number(data.total),
      image:/^https:\/\//.test(data.image || "") ? data.image : "",
      details:`Browsing ${site.name}`, browseState:safeText(data.browseState),
      playerFrames:Array.isArray(data.playerFrames) ? data.playerFrames.filter(url => /^https?:\/\//.test(url)).slice(0,20) : []};
    page.frames.set(0, {media:cleanMedia(data.media), receivedAt:Date.now()});
    pages.set(tabId, page);
  } else {
    const page = pages.get(tabId);
    if (!state.playerAccess || page?.top?.kind !== "watching") return;
    // Follow the browser's frame tree to the direct player iframe listed by the top document.
    // This rejects unrelated ad frames, referrer-only matches, and stale documents after navigation.
    const frames = await chrome.webNavigation.getAllFrames({tabId});
    const frame = frames?.find(item => item.frameId === sender.frameId && item.documentId === sender.documentId);
    const root = frames?.find(item => item.frameId === 0);
    if (!frame || root?.documentId !== page.documentId) return;
    let branch = frame;
    const visited = new Set();
    while (branch.parentFrameId > 0 && !visited.has(branch.frameId)) {
      visited.add(branch.frameId);
      branch = frames.find(item => item.frameId === branch.parentFrameId);
      if (!branch) return;
    }
    if (branch.parentFrameId !== 0 || !page.top.playerFrames.includes(branch.url)) return;
    if (pages.get(tabId) !== page || !enabledSite(page.top.url) || !state.playerAccess) return;
    page.frames.set(sender.frameId, {media:cleanMedia(data.media), receivedAt:Date.now(), documentId:sender.documentId});
  }
  state.lastUpdate = Date.now();
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(selectCurrent, 80);
}

function activitySig() {
  if (!current) return "";
  return JSON.stringify({
    site:current.siteId, url:current.url, kind:current.kind, title:current.title, browseDetails:current.details, browseState:current.browseState,
    episode:current.episode, total:current.total,
    state:current.state, p:Math.floor(current.position||0), d:Math.floor(current.duration||0),
    image:current.image, mode:settings.playbackMode, ts:settings.showTimestamp,
    details:settings.detailsTemplate, line:settings.stateTemplate
  });
}

function sendActivity(force=false) {
  if (!settings.enabled || !current || activitySuppressed) return;
  const sig = activitySig(), now = Date.now();
  if (now - lastActivitySentAt < 5000) return;
  if (!force && sig === lastActivitySig && now-lastActivitySentAt < 15000) return;
  if (sendNative({type:"activity", data:current, settings:nativeConfig()})) {
    lastActivitySig = sig;
    lastActivitySentAt = now;
  }
}

function normalizeTitle(s="") {
  return s.toLowerCase().replace(/\b(season|part|cour)\s*\d+\b/g," ").replace(/[^a-z0-9]+/g," ").trim();
}

function similarity(a,b) {
  a = new Set(normalizeTitle(a).split(/\s+/).filter(Boolean));
  b = new Set(normalizeTitle(b).split(/\s+/).filter(Boolean));
  if (!a.size || !b.size) return 0;
  let hit=0; for (const x of a) if (b.has(x)) hit++;
  return hit / Math.max(a.size,b.size);
}

function applyCover(title, url, source) {
  if (!/^https:\/\//.test(url)) return;
  for (const page of pages.values()) {
    if (page.top.title === title) page.cover = {title, url, source};
  }
  if (current?.title === title) {
    current.image = url; current.artworkSource = source; sendActivity(true); broadcast();
  }
}

async function resolveAlternateCover(title, failedUrl="") {
  if (!title) return;
  const key = normalizeTitle(title);
  const now = Date.now();
  const last = lastArtworkResolve.get(key) || 0;
  if (now-last < 60000) return;
  lastArtworkResolve.set(key, now);

  const cacheKey = `artwork:${key}`;
  const cached = (await chrome.storage.local.get(cacheKey))[cacheKey];
  if (cached?.url && cached.expires > now && cached.url !== failedUrl) {
    applyCover(title, cached.url, "cache");
    return;
  }

  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=5&sfw=true`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Artwork lookup HTTP ${r.status}`);
    const data = await r.json();
    const rows = Array.isArray(data.data) ? data.data : [];
    rows.sort((a,b)=>Math.max(similarity(title,b.title), similarity(title,b.title_english||"")) - Math.max(similarity(title,a.title), similarity(title,a.title_english||"")));
    const found = rows.find(x => Math.max(similarity(title,x.title), similarity(title,x.title_english||"")) >= 0.65 && x?.images?.jpg?.large_image_url && x.images.jpg.large_image_url !== failedUrl);
    if (!found) return;
    const cover = found.images.jpg.large_image_url;
    await chrome.storage.local.set({[cacheKey]:{url:cover, expires:now+7*24*60*60*1000, provider:"Jikan"}});
    applyCover(title, cover, "Jikan");
  } catch (e) {
    state.lastError = `Cover lookup: ${e.message}`;
    broadcast();
  }
}

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === "install") {
    chrome.tabs.create({url:chrome.runtime.getURL("onboarding.html")}).catch(()=>{});
  }
  syncPlayerAccess();
});

chrome.permissions.onAdded.addListener(() => syncPlayerAccess());
chrome.permissions.onRemoved.addListener(() => syncPlayerAccess());

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  if (!msg || typeof msg !== "object") return false;
  if (msg.type === "frameState" && tabId != null) { ready.then(() => acceptFrame(sender,msg.data)).then(() => sendResponse({ok:true})).catch(error => sendResponse({ok:false,error:error.message})); return true; }
  if (sender.tab || !sender.url?.startsWith(chrome.runtime.getURL(""))) return false;
  if (msg.type === "getState") { ready.then(() => {connectNative(); sendResponse(state);}); return true; }
  if (msg.type === "setSettings") {
    const incoming = {...(msg.settings||{})};
    for (const key of Object.keys(incoming)) if (!(key in DEFAULTS) || key === "client_id") delete incoming[key];
    if (incoming.enabledSites) incoming.enabledSites = Object.fromEntries(AnimeRPCSites.sites.map(site => [site.id, incoming.enabledSites[site.id] === true]));
    const beforeNative = JSON.stringify(nativeConfig());
    settings = {...settings, ...incoming, client_id:PUBLISHER_CLIENT_ID};
    chrome.storage.local.set(settings);
    state.settings = settings;
    const nativeChanged = beforeNative !== JSON.stringify(nativeConfig());
    if (nativeChanged) sendNative({type:"config", config:nativeConfig()});
    if (nativeChanged) sendActivity(true);
    selectCurrent();
    refreshTabs().catch(() => {});
    broadcast(); sendResponse({ok:true}); return true;
  }
  if (msg.type === "syncPlayerAccess") { syncPlayerAccess().then(()=>sendResponse({ok:true,playerAccess:state.playerAccess})); return true; }
  if (msg.type === "refresh") { refreshNow().then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false,error:e.message})); return true; }
  if (msg.type === "test") { sendNative({type:"test", settings:nativeConfig()}); sendResponse({ok:true}); return true; }
  if (msg.type === "clear") { activitySuppressed=true; current=null; sendNative({type:"clear"}); broadcast(); sendResponse({ok:true}); return true; }
  if (msg.type === "coverFailed") { resolveAlternateCover(msg.title, msg.url, true); sendResponse({ok:true}); return true; }
  if (msg.type === "health") {
    const startedAt = Date.now();
    state.repair = {kind:"health", pending:true, startedAt, summary:"Checking system health…"};
    broadcast();
    const sent = sendNative({type:"health"});
    if (!sent) {
      state.repair = {kind:"health", pending:false, ok:false, installationOk:false, runtimeOk:false, summary:"Desktop helper is unavailable."};
      broadcast();
      sendResponse({ok:false});
      return true;
    }
    setTimeout(() => {
      if (state.repair?.kind === "health" && state.repair?.pending && state.repair?.startedAt === startedAt) {
        state.repair = {kind:"health", pending:false, ok:false, installationOk:false, runtimeOk:false, summary:"Desktop helper did not answer the health check."};
        broadcast();
      }
    }, 1800);
    sendResponse({ok:true}); return true;
  }
  if (msg.type === "repair") { sendNative({type:"repair"}); sendResponse({ok:true}); return true; }
  if (msg.type === "copyDiagnostics") {
    const d = current;
    sendResponse({text:[
      `Anime-RPC ${VERSION}`, `Made by viesca27`,
      `Discord application: Bundled`,
      `Player access: ${state.playerAccess?"Enabled":"Limited"}`,
      `Appearance preset: ${settings.preset || "custom"}`,
      `Browsing artwork: square PNG (crop-safe)`,
      `Native helper: ${state.nativeConnected?"Connected":"Disconnected"}`,
      `Helper version: ${state.hostVersion||"—"}`,
      `Helper channel: ${state.helperChannel||"—"}`,
      `Helper protocol: ${state.helperProtocol||"—"}`,
      `Discord RPC: ${state.discordConnected?"Connected":"Not connected"}`,
      `Site: ${d?.siteName || "Not detected"}`,
      `Player: ${d?.duration?"Detected":"Waiting"}`,
      `Playback: ${d?.state||"—"}`, `RPC mode: ${state.rpcVariant||"—"}`,
      `Last error: ${state.lastError||"none"}`
    ].join("\n")}); return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.url || change.status === "loading" || !enabledSite(tab.url)) {
    pages.delete(tabId);
    selectCurrent();
  }
});
chrome.tabs.onRemoved.addListener(tabId => { pages.delete(tabId); selectCurrent(); });
chrome.tabs.onActivated.addListener(({tabId}) => { activeTabId = tabId; selectCurrent(); });
chrome.webNavigation.onCommitted.addListener(details => {
  if (details.frameId === 0) pages.delete(details.tabId);
  else pages.get(details.tabId)?.frames.delete(details.frameId);
  selectCurrent();
});
const ready = init();
setInterval(() => { connectNative(); selectCurrent(); }, 5000);
