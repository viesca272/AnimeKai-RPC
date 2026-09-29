(() => {
  const sites = AnimeRPCSites;
  // AnimePahe uses session IDs in /play/ URLs; those IDs are not episode numbers.
  sites.register("animepahe", (doc, url) => ({
    watching: /^\/play\/[^/]+\/[^/]+/.test(url.pathname),
    title: sites.title(doc, [".theatre-info h1 a", ".theatre-info h1", ".anime-title", "h1"], "animepahe"),
    episode: sites.episode(doc, url, ["#episodeMenu", ".episode-menu .active", ".theatre-info .episode"]),
    total: sites.total(doc, [".anime-info", ".anime-info-wrapper"]),
    image: sites.image(doc, url, [".anime-poster img"]),
    playerFrames: sites.playerFrames(doc, ["#player iframe", "iframe#player", ".theatre iframe"], url)
  }));
})();
