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
  let mutationTimer = null;
  let burstTimers = [];
  let lastUrl = location.href;

  function watchInfo() {
    let m = location.pathname.match(/\/watch\/([^/]+)\/ep-(\d+)/i);
    if (!m) m = location.pathname.match(/\/watch\/([^/]+).*?(?:episode|ep)[-_ ]?(\d+)/i);
    return m ? { slug: decodeURIComponent(m[1]), episode: Number(m[2]) } : null;
  }

  function browsingState() {
    const u = new URL(location.href);
    const searching = /\/search(?:\/|$)/i.test(u.pathname)
      || ["q", "query", "keyword", "search"].some(k => u.searchParams.has(k));
    return searching ? "Searching for something to watch" : "Finding something to watch";
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
      const data = i ? {
        role: "top",
        kind: "watching",
        url: location.href,
        title: seriesTitle(i),
        episode: i.episode,
        total: total(),
        image: cover(),
        media: m,
        timestamp: Date.now()
      } : {
        role: "top",
        kind: "browsing",
        url: location.href,
        title: "AnimeKai",
        details: "Browsing AnimeKai",
        browseState: browsingState(),
        image: "",
        media: { found: false, state: "browsing", position: 0, duration: 0, source: location.href },
        timestamp: Date.now()
      };

      const sig = JSON.stringify({
        role: data.role, kind: data.kind, url: data.url, title: data.title,
        episode: data.episode, total: data.total, image: data.image,
        browseState: data.browseState, state: data.media?.state,
        p: Math.floor(data.media?.position || 0), d: Math.floor(data.media?.duration || 0),
        found: !!data.media?.found
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
      ["play", "playing", "pause", "waiting", "canplay", "canplaythrough", "stalled", "ended",
       "loadedmetadata", "durationchange", "seeking", "seeked", "timeupdate", "emptied"]
        .forEach(e => v.addEventListener(e, () => {
          lastSent = "";
          send();
        }, { passive: true }));
    }
  }

  function queueBurst() {
    for (const timer of burstTimers) clearTimeout(timer);
    burstTimers = [0, 180, 500, 1100].map(delay => setTimeout(() => {
      hook();
      lastSent = "";
      send(true);
    }, delay));
  }

  function onRouteMaybeChanged() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    lastSent = "";
    lastHeartbeat = 0;
    lastPos = 0;
    lastPosAt = 0;
    video = null;
    queueBurst();
  }

  function patchHistory() {
    for (const name of ["pushState", "replaceState"]) {
      const original = history[name];
      if (typeof original !== "function") continue;
      history[name] = function(...args) {
        const result = original.apply(this, args);
        queueMicrotask(onRouteMaybeChanged);
        return result;
      };
    }
    addEventListener("popstate", onRouteMaybeChanged, { passive: true });
    addEventListener("hashchange", onRouteMaybeChanged, { passive: true });
  }

  function observeDom() {
    const start = () => {
      if (!document.documentElement) return setTimeout(start, 25);
      new MutationObserver(() => {
        clearTimeout(mutationTimer);
        mutationTimer = setTimeout(() => {
          onRouteMaybeChanged();
          hook();
          send();
        }, 45);
      }).observe(document.documentElement, { childList: true, subtree: true });
      hook();
      queueBurst();
    };
    start();
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type !== "forceRefresh") return;
    lastSent = "";
    lastHeartbeat = 0;
    hook();
    queueBurst();
    sendResponse?.({ok:true});
    return true;
  });

  patchHistory();

  // Send a browsing state immediately at document_start. DOM-dependent title,
  // artwork and player data will replace it as soon as the page is ready.
  if (isTop) send(true);
  observeDom();

  // Slow safety heartbeat; playback events and route changes handle the fast path.
  setInterval(() => {
    onRouteMaybeChanged();
    hook();
    send(true);
  }, 3000);
})();