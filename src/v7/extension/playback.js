(() => {
  "use strict";
  function mediaState(video) {
    if (!video) return { found: false, state: "waiting", position: 0, duration: 0 };
    const position = Number.isFinite(video.currentTime) ? Math.max(0, video.currentTime) : 0;
    const duration = Number.isFinite(video.duration) ? Math.max(0, video.duration) : 0;
    // The media element is authoritative. A recent timeupdate must not override pause.
    const state = video.ended ? "ended" : video.paused ? "paused" : video.seeking || video.readyState < 3 ? "buffering" : "playing";
    return { found: true, state, position, duration };
  }
  function rank(media) {
    if (!media?.found) return 0;
    return { playing: 50, buffering: 40, paused: 30, ended: 20, waiting: 0 }[media.state] || 0;
  }
  function selectTab(candidates, selectedId, activeId) {
    const score = item => item.kind === "browsing" ? 1 : rank({ found: item.found, state: item.state }) + 5;
    return [...candidates].sort((a, b) => score(b) - score(a)
      || Number(b.tabId === selectedId) - Number(a.tabId === selectedId)
      || Number(b.tabId === activeId) - Number(a.tabId === activeId)
      || a.tabId - b.tabId)[0] || null;
  }
  globalThis.AnimeRPCPlayback = { mediaState, rank, selectTab };
})();
