(() => {
  "use strict";

  if (globalThis.__ANIMEKAI_RPC_V6_CONTENT__) return;
  globalThis.__ANIMEKAI_RPC_V6_CONTENT__ = true;

  const isAnimeKaiHost = (host = "") => {
    host = String(host).toLowerCase();
    return host === "animekai.be" || host.endsWith(".animekai.be");
  };

  function isInsideAnimeKai() {
    try {
      if (isAnimeKaiHost(location.hostname)) return true;
      for (const origin of Array.from(location.ancestorOrigins || [])) {
        try { if (isAnimeKaiHost(new URL(origin).hostname)) return true; } catch {}
      }
      if (document.referrer) {
        try { if (isAnimeKaiHost(new URL(document.referrer).hostname)) return true; } catch {}
      }
    } catch {}
    return false;
  }

  if (!isInsideAnimeKai()) return;

  const isTop = window.top === window;
  const clean = s => (s || "").replace(/\s+/g, " ").trim();
  const meta = (n, a = "property") => document.querySelector(`meta[${a}="${n}"]`)?.content?.trim() || "";

  let lastPos = 0;
  let lastPosAt = 0;
  let video = null;
  let lastSent = "";
  let lastHeartbeat = 0;

  function watchInfo() {
    let m = location.pathname.match(/\/watch\/([^/]+)\/ep-(\d+)/i);
    if (!m) m = location.pathname.match(/\/watch\/([^/]+).*?(?:episode|ep)[-_ ]?(\d+)/i);
    return m ? { slug: decodeURIComponent(m[1]), episode: Number(m[2]) } : null;
  }

  function seriesTitle(i) {
    for (let s of [
      clean(document.querySelector("main h1")?.textContent),
      clean(document.querySelector("h1")?.textContent),
      meta("og:title"),
      meta("twitter:title", "name"),
      document.title
    ]) {
      s = clean(s)
        .replace(/\s*(?:[-|•]\s*)?(?:Episode|EP)\s*\d+.*$/i, "")
        .replace(/\s*[-|•]\s*AnimeKai.*$/i, "")
        .trim();
      if (s && !/^AnimeKai$/i.test(s)) return s;
    }
    return i?.slug?.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Anime";
  }

  function cover() {
    for (const v of [meta("og:image"), meta("twitter:image", "name"), meta("twitter:image:src", "name")]) {
      try { if (v) return new URL(v, location.href).href; } catch {}
    }
    const i = [...document.images].find(x => x.currentSrc && (x.naturalWidth >= 200 || x.width >= 200));
    return i?.currentSrc || i?.src || "";
  }

  function total() {
    const b = document.body?.innerText || "";
    for (const r of [
      /\b(\d{1,4})\s+\d{1,4}\s+(?:TV|ONA|OVA|Movie)\b/i,
      /\bEpisodes?\s*[:\-]?\s*(\d{1,4})\b/i,
      /\bTotal\s+Episodes?\s*[:\-]?\s*(\d{1,4})\b/i
    ]) {
      const m = b.match(r);
      if (m) return Number(m[1]);
    }
    return null;
  }

  function videos(root = document) {
    const out = [];
    try { out.push(...root.querySelectorAll("video")); } catch {}
    try {
      for (const e of root.querySelectorAll("*")) {
        if (e.shadowRoot) out.push(...videos(e.shadowRoot));
      }
    } catch {}
    return [...new Set(out)];
  }

  function choose() {
    const vs = videos();
    if (video && vs.includes(video)) return video;
    return vs.find(v => v.readyState >= 2 && Number.isFinite(v.duration) && v.duration > 0)
      || vs.find(v => v.readyState >= 2)
      || vs[0]
      || null;
  }

  function mediaState(v) {
    if (!v) return { found: false, state: "waiting", position: 0, duration: 0, source: location.href };
    const now = performance.now();
    const pos = Number.isFinite(v.currentTime) ? v.currentTime : 0;
    const dur = Number.isFinite(v.duration) ? v.duration : 0;
    let st = "paused";
    if (v.ended) st = "ended";
    else if (!v.paused && !v.seeking && v.readyState >= 2) st = "playing";
    if (pos > lastPos + 0.04) {
      lastPos = pos;
      lastPosAt = now;
      if (!v.ended) st = "playing";
    } else if (lastPosAt && now - lastPosAt < 1800 && !v.ended) {
      st = "playing";
    } else if (!v.ended && (v.readyState < 3 || v.seeking)) {
      st = "buffering";
    }
    return { found: true, state: st, position: pos, duration: dur, source: location.href };
  }

  function send(forceHeartbeat = false) {
    const i = watchInfo();
    video = choose();
    const m = mediaState(video);
    if (isTop) {
      if (!i) {
        chrome.runtime.sendMessage({ type: "clearPage" }).catch(() => {});
        return;
      }
      const data = {
        role: "top",
        url: location.href,
        title: seriesTitle(i),
        episode: i.episode,
        total: total(),
        image: cover(),
        media: m,
        timestamp: Date.now()
      };
      const sig = JSON.stringify({
        role: data.role, url: data.url, title: data.title, episode: data.episode,
        total: data.total, image: data.image, state: m.state,
        p: Math.floor(m.position), d: Math.floor(m.duration), found: m.found
      });
      const now = Date.now();
      if (!forceHeartbeat && sig === lastSent && now - lastHeartbeat < 2500) return;
      lastSent = sig;
      lastHeartbeat = now;
      chrome.runtime.sendMessage({ type: "frameState", data }).catch(() => {});
      return;
    }
    const data = { role: "frame", url: location.href, media: m, timestamp: Date.now() };
    const sig = JSON.stringify({
      role: data.role, url: data.url, state: m.state,
      p: Math.floor(m.position), d: Math.floor(m.duration), found: m.found
    });
    const now = Date.now();
    if (!forceHeartbeat && sig === lastSent && now - lastHeartbeat < 2500) return;
    lastSent = sig;
    lastHeartbeat = now;
    chrome.runtime.sendMessage({ type: "frameState", data }).catch(() => {});
  }

  function hook() {
    for (const v of videos()) {
      if (v.dataset.akV6) continue;
      v.dataset.akV6 = "1";
      ["play", "playing", "pause", "waiting", "canplay", "canplaythrough", "stalled", "ended", "loadedmetadata", "durationchange", "seeking", "seeked", "timeupdate"]
        .forEach(e => v.addEventListener(e, () => { lastSent = ""; send(); }, { passive: true }));
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type !== "forceRefresh") return;
    lastSent = "";
    lastHeartbeat = 0;
    hook();
    send(true);
    sendResponse?.({ok:true});
    return true;
  });

  hook();
  send();
  setInterval(() => { hook(); send(true); }, 2000);
  new MutationObserver(() => { hook(); send(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
