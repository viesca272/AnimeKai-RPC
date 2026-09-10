const $ = id => document.getElementById(id);
let lastState = null;

const PRESETS = {
  animekai: {name:"AnimeKai", accent:"#8b5cf6", background:"#0c0b12", cardBackground:"#16131d", theme:"dark"},
  borealis: {name:"Borealis", accent:"#5eead4", background:"#07171a", cardBackground:"#0d2629", theme:"dark"},
  charcoal: {name:"Charcoal", accent:"#b4b4b8", background:"#101113", cardBackground:"#1b1d20", theme:"dark"},
  midnight: {name:"Midnight", accent:"#60a5fa", background:"#070b18", cardBackground:"#10182c", theme:"dark"},
  sakura: {name:"Sakura", accent:"#f472b6", background:"#190d16", cardBackground:"#2a1424", theme:"dark"},
  ember: {name:"Ember", accent:"#fb923c", background:"#1a0f09", cardBackground:"#2a1810", theme:"dark"}
};

const fmt = seconds => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const validHex = value => /^#[0-9a-f]{6}$/i.test(String(value || ""));

function setCss(name, value) {
  document.documentElement.style.setProperty(name, value);
}

function resolvedTheme(theme) {
  if (theme !== "system") return theme;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTextMode(theme) {
  const light = resolvedTheme(theme) === "light";
  document.documentElement.style.colorScheme = light ? "light" : "dark";
  setCss("--text", light ? "#17131d" : "#f6f2ff");
  setCss("--muted", light ? "#675f70" : "#a8a0b4");
  setCss("--border", light ? "rgba(45,35,55,.24)" : "rgba(170,150,195,.20)");
  setCss("--button", light ? "rgba(255,255,255,.42)" : "rgba(255,255,255,.075)");
  setCss("--field", light ? "rgba(255,255,255,.58)" : "rgba(0,0,0,.20)");
  setCss("--cover", light ? "rgba(30,20,40,.10)" : "rgba(255,255,255,.08)");
  setCss("--bar", light ? "rgba(30,20,40,.14)" : "rgba(255,255,255,.11)");
}

function applyTheme(s) {
  const settings = s?.settings || {};
  const accent = validHex(settings.accent) ? settings.accent : PRESETS.animekai.accent;
  const background = validHex(settings.background) ? settings.background : PRESETS.animekai.background;
  const cardBackground = validHex(settings.cardBackground) ? settings.cardBackground : PRESETS.animekai.cardBackground;
  const theme = settings.theme || "dark";
  const preset = settings.preset || "animekai";

  setCss("--accent", accent);
  setCss("--bg", background);
  setCss("--card", cardBackground);
  applyTextMode(theme);

  $("accent").value = accent;
  $("hex").value = accent;
  $("background").value = background;
  $("bgHex").value = background;
  $("cardColor").value = cardBackground;
  $("cardHex").value = cardBackground;
  $("theme").value = theme;
  $("compact").checked = !!settings.compact;
  $("reduced").checked = !!settings.reducedMotion;

  document.querySelectorAll(".preset").forEach(button => {
    button.classList.toggle("active", button.dataset.preset === preset);
  });
  $("presetName").textContent = PRESETS[preset]?.name || "Custom";
}

function renderSetup(s) {
  const playerEnabled = !!s.playerAccess;
  $("playerAccessState").textContent = playerEnabled ? "Player detection ✓" : "Player detection limited";
  $("playerAccess").textContent = playerEnabled ? "Enabled" : "Enable";
  $("playerAccess").disabled = playerEnabled;

  if (!s.nativeConnected) {
    $("helperState").textContent = "Desktop helper missing";
    $("helperHint").textContent = "Install the Windows helper to connect Discord";
    $("helper").textContent = "Install";
  } else if (s.hostVersion && s.hostVersion !== s.version) {
    $("helperState").textContent = "Desktop helper update available";
    $("helperHint").textContent = `Installed ${s.hostVersion} • Extension ${s.version}`;
    $("helper").textContent = "Update";
  } else {
    $("helperState").textContent = "Desktop helper ✓";
    $("helperHint").textContent = s.hostVersion ? `${s.hostVersion} is installed` : "Connected";
    $("helper").textContent = "Reinstall";
  }
}

function render(s) {
  lastState = s;
  applyTheme(s);
  renderSetup(s);

  const native = !!s.nativeConnected;
  const discord = !!s.discordConnected;
  $("dot").className = `dot ${native && discord ? "good" : native ? "warn" : "bad"}`;
  $("statusText").textContent = native
    ? (discord ? "Ready • Discord connected" : "Helper connected • Discord not ready")
    : (s.lastError || "Desktop helper missing");

  const d = s.current;
  if (d) {
    $("anime").textContent = d.title || "Anime";
    $("episode").textContent = `Episode ${d.episode ?? "—"}${d.total ? ` / ${d.total}` : ""}`;
    $("playback").textContent = d.state || "—";
    $("time").textContent = `${fmt(d.position)} / ${fmt(d.duration)}`;
    $("fill").style.width = d.duration ? `${Math.min(100, d.position / d.duration * 100)}%` : "0%";
    if (d.image) {
      $("cover").src = d.image;
      $("cover").onerror = () => chrome.runtime.sendMessage({type:"coverFailed", title:d.title, url:d.image});
    }
  } else {
    $("anime").textContent = "Nothing detected";
    $("episode").textContent = "—";
    $("playback").textContent = "—";
    $("time").textContent = "00:00 / 00:00";
    $("cover").removeAttribute("src");
    $("fill").style.width = "0%";
  }

  $("diag").innerHTML =
    `Discord app: <b>Bundled ✓</b><br>` +
    `Player access: <b>${s.playerAccess ? "Enabled" : "Limited"}</b><br>` +
    `Native helper: <b>${native ? "Connected" : "Disconnected"}</b><br>` +
    `Helper version: <b>${s.hostVersion || "—"}</b><br>` +
    `Discord RPC: <b>${discord ? "Connected" : "Not connected"}</b><br>` +
    `AnimeKai: <b>${d ? "Detected" : "Not detected"}</b><br>` +
    `Player: <b>${d?.duration ? "Detected" : "Waiting"}</b><br>` +
    `Playback: <b>${d?.state || "—"}</b><br>` +
    `RPC mode: <b>${s.rpcVariant || "—"}</b>` +
    (s.lastError ? `<br>Error: <b>${s.lastError}</b>` : "");

  if (s.repair) {
    const r = s.repair;
    $("repairState").textContent = r.ok ? "Healthy ✓" : "Needs attention";
    $("repairResult").textContent = r.fixed?.length
      ? `Fixed: ${r.fixed.join(", ")}`
      : (r.summary || "Health check complete");
  }
}

function getState() {
  chrome.runtime.sendMessage({type:"getState"}, r => { if (r) render(r); });
}

function currentAppearance(preset = "custom") {
  const accent = validHex($("hex").value) ? $("hex").value : $("accent").value;
  const background = validHex($("bgHex").value) ? $("bgHex").value : $("background").value;
  const cardBackground = validHex($("cardHex").value) ? $("cardHex").value : $("cardColor").value;
  return {
    accent,
    background,
    cardBackground,
    preset,
    theme:$("theme").value,
    compact:$("compact").checked,
    reducedMotion:$("reduced").checked
  };
}

function saveAppearance(preset = "custom") {
  chrome.runtime.sendMessage({type:"setSettings", settings:currentAppearance(preset)}, getState);
}

function applyPreset(key) {
  const p = PRESETS[key];
  if (!p) return;
  $("accent").value = p.accent;
  $("hex").value = p.accent;
  $("background").value = p.background;
  $("bgHex").value = p.background;
  $("cardColor").value = p.cardBackground;
  $("cardHex").value = p.cardBackground;
  $("theme").value = p.theme;
  chrome.runtime.sendMessage({
    type:"setSettings",
    settings:{...p, preset:key, compact:$("compact").checked, reducedMotion:$("reduced").checked}
  }, getState);
}

function refresh() {
  const button = $("refresh");
  button.disabled = true;
  button.textContent = "Refreshing…";
  chrome.runtime.sendMessage({type:"refresh"}, () => setTimeout(() => {
    getState();
    button.disabled = false;
    button.textContent = "↻ Refresh";
  }, 900));
}

async function enablePlayerAccess() {
  const button = $("playerAccess");
  button.disabled = true;
  button.textContent = "Requesting…";
  try {
    const granted = await chrome.permissions.request({origins:["<all_urls>"]});
    await chrome.runtime.sendMessage({type:"syncPlayerAccess"});
    if (granted) {
      button.textContent = "Enabled ✓";
      setTimeout(refresh, 200);
    } else {
      button.disabled = false;
      button.textContent = "Enable";
    }
  } catch {
    button.disabled = false;
    button.textContent = "Enable";
  }
  setTimeout(getState, 500);
}

function openSetupRelease() {
  chrome.tabs.create({url:lastState?.setupUrl || "https://github.com/viesca272/AnimeKai-RPC/releases/tag/v6.0.0-alpha.5"});
}

$("accent").oninput = e => { $("hex").value = e.target.value; saveAppearance(); };
$("hex").onchange = () => saveAppearance();
$("background").oninput = e => { $("bgHex").value = e.target.value; saveAppearance(); };
$("bgHex").onchange = () => saveAppearance();
$("cardColor").oninput = e => { $("cardHex").value = e.target.value; saveAppearance(); };
$("cardHex").onchange = () => saveAppearance();
$("theme").onchange = () => saveAppearance();
$("compact").onchange = () => saveAppearance(lastState?.settings?.preset || "custom");
$("reduced").onchange = () => saveAppearance(lastState?.settings?.preset || "custom");
$("resetTheme").onclick = () => applyPreset("animekai");
document.querySelectorAll(".preset").forEach(button => button.onclick = () => applyPreset(button.dataset.preset));
$("refresh").onclick = refresh;
$("playerAccess").onclick = enablePlayerAccess;
$("helper").onclick = openSetupRelease;
$("setup").onclick = () => chrome.tabs.create({url:chrome.runtime.getURL("onboarding.html")});
$("health").onclick = () => chrome.runtime.sendMessage({type:"health"}, () => setTimeout(getState, 500));
$("repair").onclick = () => {
  if (confirm("Repair AnimeKai RPC? Your themes and personal settings will be kept.")) {
    chrome.runtime.sendMessage({type:"repair"}, () => setTimeout(getState, 800));
  }
};
$("test").onclick = () => chrome.runtime.sendMessage({type:"test"}, () => setTimeout(getState, 500));
$("clear").onclick = () => chrome.runtime.sendMessage({type:"clear"}, getState);
$("open").onclick = () => chrome.tabs.create({url:"https://animekai.be/"});
$("copy").onclick = () => chrome.runtime.sendMessage({type:"copyDiagnostics"}, async r => {
  await navigator.clipboard.writeText(r?.text || "");
  $("copy").textContent = "Copied ✓";
  setTimeout(() => $("copy").textContent = "Copy diagnostics", 1200);
});

matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => {
  if ((lastState?.settings?.theme || "dark") === "system") applyTheme(lastState);
});
chrome.runtime.onMessage.addListener(m => { if (m.type === "v6State") render(m.state); });
getState();
setInterval(getState, 1500);
