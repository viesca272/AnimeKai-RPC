# V6 roadmap

V6 is focused on making AnimeKai RPC something another person can install without needing to understand how it works internally.

## Alpha

- [x] Preserve stable playback detection
- [x] Add appearance customization foundation
- [x] Add custom accent/background/card colors
- [x] Add built-in appearance presets (AnimeKai, Borealis, Charcoal, Midnight, Sakura, Ember)
- [x] Add Repair App request + native helper repair routine
- [x] Add alternate cover-art resolver and cache
- [x] Remove dependence on a generic fallback artwork asset
- [x] Add GitHub Pages project site
- [x] Bundle the public Discord Application ID
- [x] Restore V5-style extension artwork
- [x] Add first-run onboarding
- [x] Add helper install/update status in the popup
- [ ] Add theme import/export
- [ ] Finish compact-layout polish
- [ ] Test upgrade from V5 on multiple Windows installs
- [ ] Finish plain-English errors for every common failure

## Store prep

- [x] Remove `<all_urls>` from required install-time host permissions
- [x] Move changing third-party player-frame access behind an optional user-granted permission
- [ ] Verify the optional player permission flow in Opera, Chrome and Edge
- [ ] Finalize privacy policy against actual production behavior
- [ ] Create store screenshots and promotional artwork
- [ ] Publish first test listing
- [ ] Record Chrome / Edge production extension IDs
- [ ] Add production IDs to the helper allowlist

## Public release

- [ ] Signed desktop-helper installer
- [x] Guided helper update detection / download path
- [ ] True automatic helper update installation
- [ ] Browser-store install buttons on the website
- [ ] Stable V6 release and migration notes
