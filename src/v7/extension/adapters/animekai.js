(() => {
  const sites = AnimeRPCSites;
  sites.register("animekai", (doc, url) => ({
    watching: /^\/watch\//.test(url.pathname),
    title: sites.title(doc, ["main h1", "h1", ".entity-scroll .title"], "AnimeKai"),
    episode: sites.episode(doc, url, ["#episodes .active", ".episodes .active", "[data-episode].active"]),
    total: sites.total(doc, [".entity-scroll", ".info", ".anime-info"]),
    image: sites.image(doc, url, [".poster img", ".anime-poster img"]),
    playerFrames: sites.playerFrames(doc, ["#player iframe", "#player-wrapper iframe", "#watch-player iframe", ".player iframe"], url)
  }));
})();
