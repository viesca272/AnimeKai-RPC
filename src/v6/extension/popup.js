const $ = id => document.getElementById(id);
let lastState = null;

const fmt = seconds => {
  const s = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

function applyTheme(s) {
  const accent = s?.settings?.accent || "#8b5cf6";
  document.documentElement.style.setProperty("--accent", accent);
  $("accent").value = accent;
  $("hex").value = accent;
  $("theme").value = s?.settings?.theme || "dark";
  $("compact").checked = !!s?.settings?.compact;
  $("reduced").checked = !!s?.settings?.reducedMotion;
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

function saveAppearance() {
  const accent = /^#[0-9a-f]{6}$/i.test($("hex").value) ? $("hex").value : $("accent").value;
  chrome.runtime.sendMessage({
    type:"setSettings",
    settings:{
      accent,
      theme:$("theme").value,
      compact:$("compact").checked,
      reducedMotion:$("reduced").checked
    }
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
  chrome.tabs.create({url:lastState?.setupUrl || "https://github.com/viesca272/AnimeKai-RPC/releases/tag/v6.0.0-alpha.4"});
}

$("accent").oninput = e => { $("hex").value = e.target.value; saveAppearance(); };
$("hex").onchange = saveAppearance;
$("theme").onchange = saveAppearance;
$("compact").onchange = saveAppearance;
$("reduced").onchange = saveAppearance;
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

chrome.runtime.onMessage.addListener(m => { if (m.type === "v6State") render(m.state); });
getState();
setInterval(getState, 1500);
