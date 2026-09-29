(() => {
  "use strict";
  const questions = [
    {title:"Install the Windows helper", keywords:["install", "setup", "helper", "download", "python"], answer:"Download the V7 alpha Windows ZIP, extract it, and run Install Anime-RPC.cmd. Load its extension folder from your browser’s Extensions page. Close other Anime-RPC/AnimeKai RPC extension copies first. No Python or Discord developer account is needed."},
    {title:"Nothing appears on Discord", keywords:["discord", "connect", "connection", "show", "nothing", "rpc"], answer:"Open Discord desktop, then use Refresh and Run health check in the extension popup. Check that sharing and your current site are enabled. Use Repair App if the helper or registration is broken. Discord in a browser is not enough."},
    {title:"Player says waiting", keywords:["waiting", "player", "detect", "permission", "episode"], answer:"Enable Player detection in setup, reload the watch page, and start an episode. AnimePahe and 9anime are experimental and disabled by default; enable them in Sites to test. If waiting continues, copy diagnostics and report the site, browser, and episode URL."},
    {title:"Supported sites and browsers", keywords:["sites", "site", "support", "browser", "animepahe", "9anime", "animekai", "firefox", "mac", "linux"], answer:"This V7 alpha targets animekai.be, animepahe.com, and 9animehd.live on Windows with Chrome, Edge, or Opera. All need live V7 checks. AnimePahe and 9anime are experimental. Other mirrors, Firefox, macOS, Linux, and mobile are not supported by this package."},
    {title:"Update, repair, or return to V6", keywords:["update", "upgrade", "repair", "uninstall", "v6", "rollback"], answer:"Install the helper and reload the extension from the same version’s Windows ZIP. V7 keeps the existing native-host registration and preferences. To return to stable, run the V6.1.6 installer and load the V6 extension again. Don’t run both extension versions together."},
    {title:"Privacy and passwords", keywords:["privacy", "password", "token", "data", "key", "chat", "ai"], answer:"No Discord password or account token is needed. Playback metadata goes to your local helper and Discord; Jikan may receive the anime title for artwork. This guided help matches written FAQ answers locally. It does not send or save your questions."},
    {title:"Artwork and black badges", keywords:["cover", "image", "artwork", "badge", "black", "picture"], answer:"Browsing uses a separate image for each site. Watching uses the anime cover with black play/pause badges. Missing artwork can be looked up through Jikan. If a picture fails, the helper falls back to simpler presence. Actual Discord crops and image loading still need live testing."}
  ];
  const form = document.querySelector("form");
  const input = document.querySelector("#question");
  const answer = document.querySelector("#answer");
  for (const entry of questions) {
    const button = document.createElement("button");
    button.type = "button"; button.textContent = entry.title;
    button.onclick = () => { input.value = entry.title; answer.textContent = entry.answer; };
    document.querySelector("#suggestions").append(button);
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const words = input.value.toLowerCase().match(/[a-z0-9]+/g) || [];
    const matches = questions.map(entry => ({entry, score:entry.keywords.filter(key => words.some(word => word === key || word === key+"s")).length}));
    matches.sort((a,b) => b.score-a.score);
    answer.textContent = matches[0]?.score ? matches[0].entry.answer : "I don’t have a matching FAQ answer for that question. Try a suggested question below, the website FAQ, or open a GitHub issue with your browser and extension version.";
  });
})();
