(() => {
  const sites = AnimeRPCSites;
  sites.register("nineanime", (doc, url) => {
    const episode = sites.episode(doc, url, [".episodes .active", ".episode-list .active", "[data-episode].active", "[aria-current='true'][data-episode]"]);
    const frames = sites.playerFrames(doc, ["#player iframe", "iframe#player", "#player-wrapper iframe", ".player-container iframe", ".watch-player iframe"], url);
    // Series and season pages also use /watch/. Don't call them playback until a player or episode is present.
    return {
      watching: /^\/watch\//.test(url.pathname) && (episode !== null || frames.length > 0 || !!doc.querySelector("video")),
      title: sites.title(doc, ["h1", ".film-name"], "9Anime"),
      episode,
      total: sites.total(doc, [".episodes h2", ".episode-list h2", "#episodes h2"]),
      image: sites.image(doc, url, [".film-poster img", ".poster img"]),
      playerFrames: frames
    };
  });
})();
