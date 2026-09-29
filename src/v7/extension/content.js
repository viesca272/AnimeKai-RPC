(() => {
  "use strict";
  if (globalThis.__ANIME_RPC_V7__) return;
  globalThis.__ANIME_RPC_V7__ = true;

  const isTop = window.top === window;
  const site = AnimeRPCSites.match(location.href);
  const ancestors = [...(location.ancestorOrigins || [])];
  if (isTop ? !site : !ancestors.some(url => AnimeRPCSites.match(url))) return;

  let lastUrl = location.href;
  let lastSignature = "";
  let mutationTimer;
  let stopped = false;
  const hooked = new WeakSet();
  const mediaEvents = ["play", "playing", "pause", "waiting", "canplay", "stalled", "ended", "loadedmetadata", "durationchange", "seeking", "seeked", "timeupdate", "emptied"];

  function videos(root = document) {
    const found = [...root.querySelectorAll("video")];
    for (const element of root.querySelectorAll("*")) {
      if (element.shadowRoot) found.push(...videos(element.shadowRoot));
    }
    return found.filter(video => !video.closest("[data-ad], .ad, .advertisement"));
  }
  function chooseVideo() {
    return videos().sort((a, b) => AnimeRPCPlayback.rank(AnimeRPCPlayback.mediaState(b)) - AnimeRPCPlayback.rank(AnimeRPCPlayback.mediaState(a))
      || b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0] || null;
  }
  async function send(heartbeat = false) {
    if (stopped) return;
    try {
      const data = isTop ? AnimeRPCSites.read(document, location.href) : { url: location.href };
      if (!data) return;
      data.media = AnimeRPCPlayback.mediaState(chooseVideo());
      data.role = isTop ? "top" : "frame";
      const signature = JSON.stringify(data);
      if (!heartbeat && signature === lastSignature) return;
      lastSignature = signature;
      await chrome.runtime.sendMessage({ type: "frameState", data });
    } catch (error) {
      if (/context invalidated/i.test(error.message)) stopped = true;
    }
  }
  function scan() {
    for (const video of videos()) {
      if (hooked.has(video)) continue;
      hooked.add(video);
      for (const event of mediaEvents) video.addEventListener(event, () => send(), { passive: true });
    }
    if (lastUrl !== location.href) {
      lastUrl = location.href;
      lastSignature = "";
    }
    send();
  }
  function observe() {
    if (!document.documentElement) return setTimeout(observe, 25);
    new MutationObserver(() => {
      // Don't postpone indefinitely on pages with continuously changing elements.
      if (mutationTimer) return;
      mutationTimer = setTimeout(() => { mutationTimer = null; scan(); }, 120);
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "class", "aria-current", "data-episode"] });
    scan();
  }
  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message?.type !== "forceRefresh") return;
    lastSignature = "";
    scan();
    respond({ ok: true });
  });
  addEventListener("popstate", scan);
  addEventListener("hashchange", scan);
  observe();
  setInterval(() => { scan(); send(true); }, 3000);
})();
