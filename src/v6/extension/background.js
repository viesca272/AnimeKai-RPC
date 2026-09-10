const HOST = "com.animekai.discordrpc";
const VERSION = "6.0.0";
const PUBLISHER_CLIENT_ID = "1543575455523807385";
const PLAYER_SCRIPT_ID = "animekai-rpc-player-frames";
const SETUP_URL = "https://github.com/viesca272/AnimeKai-RPC/releases/tag/v6.0.0";
const DEFAULTS = {
  enabled: true,
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
  setupUrl: SETUP_URL
};

async function syncPlayerAccess() {
  try {
    const granted = await chrome.permissions.contains({origins:["<all_urls>"]});
    state.playerAccess = !!granted;
    const registered = await chrome.scripting.getRegisteredContentScripts({ids:[PLAYER_SCRIPT_ID]});
    if (granted && !registered.length) {
      await chrome.scripting.registerContentScripts([{
        id: PLAYER_SCRIPT_ID,
        matches: ["<all_urls>"],
        js: ["content.js"],
        runAt: "document_idle",
        allFrames: true,
        matchOriginAsFallback: true
      }]);
    } else if (!granted && registered.length) {
      await chrome.scripting.unregisterContentScripts({ids:[PLAYER_SCRIPT_ID]});
    }
  } catch (e) {
    state.playerAccess = false;
    state.lastError = `Player access setup: ${e.message}`;
  }
  broadcast();
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
  state.settings = settings;
  await syncPlayerAccess();
  connectNative();
}

function broadcast() {
  state.current = current;
  state.settings = settings;
  state.setupUrl = publisher.v6_release_url || SETUP_URL;
  chrome.runtime.sendMessage({type:"v6State", state}).catch(()=>{});
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
    if (current && settings.enabled) sendActivity(true);
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
    if (msg.artworkRejected && current?.title) resolveAlternateCover(current.title, current.image, true);
  } else if (msg?.type === "health") {
    state.repair = {kind:"health", ...msg};
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

  try {
    const tabs = await chrome.tabs.query({url:["https://animekai.be/*", "https://www.animekai.be/*"]});
    await Promise.allSettled(tabs.map(tab => tab.id != null
      ? chrome.tabs.sendMessage(tab.id, {type:"forceRefresh"})
      : Promise.resolve()));
  } catch {}

  lastActivitySig = "";
  lastActivitySentAt = 0;
  if (current && settings.enabled) sendActivity(true);
  broadcast();
}

function scoreMedia(m) {
  if (!m?.found) return -1;
  const s = {playing:40, buffering:30, paused:20, ended:10, waiting:0}[m.state] ?? 0;
  return s + (m.duration > 0 ? 5 : 0) + (m.position > 0 ? 2 : 0);
}

function merge(tabId, frameId, data) {
  const page = pages.get(tabId) || {top:null, frames:new Map()};
  if (data.role === "top") page.top = data;
  page.frames.set(frameId ?? 0, data);
  pages.set(tabId, page);
  if (!page.top?.title) return;

  const candidates = [];
  for (const frame of page.frames.values()) if (frame?.media) candidates.push(frame.media);
  candidates.sort((a,b)=>scoreMedia(b)-scoreMedia(a));
  const best = candidates[0] || {state:"waiting", position:0, duration:0};
  current = {...page.top, state:best.state, position:best.position||0, duration:best.duration||0};
  delete current.media;
  state.lastUpdate = Date.now();
  if (!current.image) resolveAlternateCover(current.title, "", false);
  sendActivity(false);
  broadcast();
}

function activitySig() {
  if (!current) return "";
  return JSON.stringify({
    title:current.title, episode:current.episode, total:current.total,
    state:current.state, p:Math.floor(current.position||0), d:Math.floor(current.duration||0),
    image:current.image, mode:settings.playbackMode, ts:settings.showTimestamp,
    details:settings.detailsTemplate, line:settings.stateTemplate
  });
}

function sendActivity(force=false) {
  if (!settings.enabled || !current) return;
  const sig = activitySig(), now = Date.now();
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

async function resolveAlternateCover(title, failedUrl="", force=false) {
  if (!title) return;
  const key = normalizeTitle(title);
  const now = Date.now();
  const last = lastArtworkResolve.get(key) || 0;
  if (!force && now-last < 60000) return;
  lastArtworkResolve.set(key, now);

  const cacheKey = `artwork:${key}`;
  const cached = (await chrome.storage.local.get(cacheKey))[cacheKey];
  if (cached?.url && cached.expires > now && cached.url !== failedUrl) {
    if (current?.title === title) { current.image = cached.url; current.artworkSource = "cache"; sendActivity(true); broadcast(); }
    return;
  }

  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=5&sfw=true`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Artwork lookup HTTP ${r.status}`);
    const data = await r.json();
    const rows = Array.isArray(data.data) ? data.data : [];
    rows.sort((a,b)=>Math.max(similarity(title,b.title), similarity(title,b.title_english||"")) - Math.max(similarity(title,a.title), similarity(title,a.title_english||"")));
    const found = rows.find(x => x?.images?.jpg?.large_image_url && x.images.jpg.large_image_url !== failedUrl);
    if (!found) return;
    const cover = found.images.jpg.large_image_url;
    await chrome.storage.local.set({[cacheKey]:{url:cover, expires:now+7*24*60*60*1000, provider:"Jikan"}});
    if (current?.title === title) { current.image = cover; current.artworkSource = "Jikan"; sendActivity(true); broadcast(); }
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
  if (msg.type === "frameState" && tabId != null) { merge(tabId, sender.frameId ?? 0, msg.data||{}); sendResponse({ok:true}); return true; }
  if (msg.type === "clearPage" && tabId != null) { pages.delete(tabId); if (!pages.size) {current=null;sendNative({type:"clear"});} broadcast(); sendResponse({ok:true}); return true; }
  if (msg.type === "getState") { connectNative(); syncPlayerAccess().then(()=>sendResponse(state)); return true; }
  if (msg.type === "setSettings") {
    const incoming = {...(msg.settings||{})};
    delete incoming.client_id;
    settings = {...settings, ...incoming, client_id:PUBLISHER_CLIENT_ID};
    chrome.storage.local.set(settings);
    state.settings = settings;
    sendNative({type:"config", config:nativeConfig()});
    sendActivity(true); broadcast(); sendResponse({ok:true}); return true;
  }
  if (msg.type === "syncPlayerAccess") { syncPlayerAccess().then(()=>sendResponse({ok:true,playerAccess:state.playerAccess})); return true; }
  if (msg.type === "refresh") { refreshNow().then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false,error:e.message})); return true; }
  if (msg.type === "test") { sendNative({type:"test", settings:nativeConfig()}); sendResponse({ok:true}); return true; }
  if (msg.type === "clear") { current=null; sendNative({type:"clear"}); broadcast(); sendResponse({ok:true}); return true; }
  if (msg.type === "coverFailed") { resolveAlternateCover(msg.title, msg.url, true); sendResponse({ok:true}); return true; }
  if (msg.type === "health") { sendNative({type:"health"}); sendResponse({ok:true}); return true; }
  if (msg.type === "repair") { sendNative({type:"repair"}); sendResponse({ok:true}); return true; }
  if (msg.type === "copyDiagnostics") {
    const d = current;
    sendResponse({text:[
      `AnimeKai RPC ${VERSION}`, `Made by viesca27`,
      `Discord application: Bundled`,
      `Player access: ${state.playerAccess?"Enabled":"Limited"}`,
      `Appearance preset: ${settings.preset || "custom"}`,
      `Native helper: ${state.nativeConnected?"Connected":"Disconnected"}`,
      `Helper version: ${state.hostVersion||"—"}`,
      `Helper channel: ${state.helperChannel||"—"}`,
      `Helper protocol: ${state.helperProtocol||"—"}`,
      `Discord RPC: ${state.discordConnected?"Connected":"Not connected"}`,
      `AnimeKai: ${d?"Detected":"Not detected"}`,
      `Player: ${d?.duration?"Detected":"Waiting"}`,
      `Playback: ${d?.state||"—"}`, `RPC mode: ${state.rpcVariant||"—"}`,
      `Last error: ${state.lastError||"none"}`
    ].join("\n")}); return true;
  }
});

chrome.tabs.onRemoved.addListener(tabId=>{pages.delete(tabId);if(!pages.size){current=null;sendNative({type:"clear"});}});
init();
setInterval(()=>{connectNative();sendActivity(false);},5000);
