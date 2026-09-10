const $ = id => document.getElementById(id);
let state = null;

async function getState() {
  state = await chrome.runtime.sendMessage({type:"getState"});
  render();
}

function render() {
  const playerEnabled = !!state?.playerAccess;
  $("playerStatus").textContent = playerEnabled
    ? "✓ Player detection is enabled"
    : "Optional permission still needs to be enabled";
  $("playerStatus").className = `status ${playerEnabled ? "good" : "warn"}`;
  $("playerAccess").textContent = playerEnabled ? "Enabled ✓" : "Enable player detection";
  $("playerAccess").disabled = playerEnabled;

  if (state?.nativeConnected && state?.hostVersion === state?.version) {
    $("helperStatus").textContent = `✓ Desktop helper ${state.hostVersion} (${state.helperChannel || "stable"}) is connected`;
    $("helperStatus").className = "status good";
    $("helper").textContent = "Reinstall helper";
  } else if (state?.nativeConnected) {
    $("helperStatus").textContent = `Helper ${state.hostVersion || "unknown"} connected — V6.0.0 update recommended`;
    $("helperStatus").className = "status warn";
    $("helper").textContent = "Update helper";
  } else {
    $("helperStatus").textContent = "Desktop helper is not connected yet";
    $("helperStatus").className = "status warn";
    $("helper").textContent = "Install helper";
  }
}

$("playerAccess").onclick = async () => {
  const button = $("playerAccess");
  button.disabled = true;
  button.textContent = "Waiting for permission…";
  try {
    await chrome.permissions.request({origins:["<all_urls>"]});
    await chrome.runtime.sendMessage({type:"syncPlayerAccess"});
    await chrome.runtime.sendMessage({type:"refresh"});
  } catch {}
  await getState();
};

$("helper").onclick = () => {
  chrome.tabs.create({url:state?.setupUrl || "https://github.com/viesca272/AnimeKai-RPC/releases/tag/v6.0.0"});
};

$("check").onclick = async () => {
  $("check").disabled = true;
  $("check").textContent = "Checking…";
  await chrome.runtime.sendMessage({type:"refresh"});
  setTimeout(async () => {
    await getState();
    $("check").disabled = false;
    $("check").textContent = "Check again";
  }, 700);
};

$("open").onclick = () => chrome.tabs.create({url:"https://animekai.be/"});

chrome.runtime.onMessage.addListener(message => {
  if (message?.type === "v6State") {
    state = message.state;
    render();
  }
});

getState();
setInterval(getState, 2500);
