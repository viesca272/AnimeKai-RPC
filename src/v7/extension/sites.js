(() => {
  "use strict";

  const adapters = new Map();
  const sites = [
    { id: "animekai", name: "AnimeKai", hosts: ["animekai.be", "www.animekai.be"], home: "https://animekai.be/", experimental: false },
    { id: "animepahe", name: "AnimePahe", hosts: ["animepahe.com", "www.animepahe.com"], home: "https://animepahe.com/", experimental: true },
    { id: "nineanime", name: "9anime", hosts: ["9animehd.live", "www.9animehd.live"], home: "https://9animehd.live/", experimental: true }
  ];
  const clean = value => String(value ?? "").replace(/\s+/g, " ").trim();
  const number = value => {
    const text = clean(value);
    if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
    const result = Number(text);
    return Number.isFinite(result) && result >= 0 ? result : null;
  };
  const match = value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? sites.find(site => site.hosts.includes(url.hostname)) || null : null;
    } catch { return null; }
  };
  const text = (doc, selectors) => {
    for (const selector of selectors) {
      const value = clean(doc.querySelector(selector)?.textContent);
      if (value) return value;
    }
    return "";
  };
  const meta = (doc, name) => doc.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content || "";
  function title(doc, selectors, brand) {
    return clean(text(doc, selectors) || meta(doc, "og:title") || doc.title)
      .replace(/^Watch\s+/i, "")
      .replace(/\s*(?:[-|•]\s*)?(?:Episode|EP)\s*\d+(?:\.\d+)?.*$/i, "")
      .replace(new RegExp(`\\s*[-|•]\\s*(?:Watch Anime.*|${brand}.*)$`, "i"), "")
      .trim();
  }
  function image(doc, url, selectors = []) {
    const node = selectors.map(s => doc.querySelector(s)).find(Boolean);
    const value = node?.getAttribute("data-src") || node?.src || meta(doc, "og:image") || meta(doc, "twitter:image");
    try { const parsed = new URL(value, url); return /^https?:$/.test(parsed.protocol) && value ? parsed.href : ""; }
    catch { return ""; }
  }
  function episode(doc, url, selectors) {
    for (const selector of selectors) {
      const node = doc.querySelector(selector);
      const value = node?.getAttribute("data-episode") || node?.getAttribute("data-num");
      if (number(value) !== null) return number(value);
      const label = clean(node?.textContent);
      const result = label.match(/(?:episode|ep)\s*[:#-]?\s*(\d+(?:\.\d+)?)/i);
      if (result) return number(result[1]);
      if (number(label) !== null) return number(label);
    }
    const path = url.pathname.match(/(?:\/episode\/|\/ep[-/]|-episode-)(\d+(?:\.\d+)?)(?:\/|$)/i);
    return path ? number(path[1]) : number(url.searchParams.get("ep"));
  }
  function total(doc, selectors) {
    const value = text(doc, selectors);
    const result = value.match(/(?:total\s+)?episodes?\s*[:(\-]?\s*(\d+)/i);
    return result ? number(result[1]) : null;
  }
  function playerFrames(doc, selectors, url) {
    return [...new Set(selectors.flatMap(s => [...doc.querySelectorAll(s)]).map(frame => {
      try {
        const src = new URL(frame.getAttribute("src"), url);
        return /^https?:$/.test(src.protocol) && frame.getAttribute("src") ? src.href : "";
      } catch { return ""; }
    }).filter(Boolean))];
  }
  globalThis.AnimeRPCSites = {
    sites, match, clean, number, text, meta, title, image, episode, total, playerFrames,
    patterns: sites.flatMap(site => site.hosts.map(host => `https://${host}/*`)),
    register(id, read) { adapters.set(id, read); },
    read(doc, value) {
      const site = match(value);
      if (!site) return null;
      const url = new URL(value);
      const data = adapters.get(site.id)?.(doc, url) || {};
      const searching = /\/search(?:\/|$)/i.test(url.pathname) || ["q", "query", "keyword", "search"].some(key => url.searchParams.has(key));
      return { siteId: site.id, siteName: site.name, siteHome: site.home, url: url.href,
        kind: data.watching && data.title ? "watching" : "browsing", title: data.title || site.name,
        episode: data.episode ?? null, total: data.total ?? null, image: data.image || "",
        details: `Browsing ${site.name}`, browseState: searching ? "Searching for something to watch" : "Finding something to watch",
        playerFrames: data.playerFrames || [] };
    }
  };
})();
