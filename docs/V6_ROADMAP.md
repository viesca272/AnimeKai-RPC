# V6 roadmap

V6 is focused on making AnimeKai RPC something another person can install without needing to understand how it works internally.

## V6.0.0 stable milestone

- [x] Preserve stable playback detection
- [x] Bundle the public Discord Application ID
- [x] Restore V5-style extension artwork
- [x] Add first-run onboarding
- [x] Add helper install/update status in the popup
- [x] Add Refresh / reconnect controls
- [x] Add Repair App + native helper repair routine
- [x] Add alternate cover-art resolver and cache
- [x] Remove dependence on a generic fallback artwork asset
- [x] Add custom accent/background/card colors
- [x] Convert built-in appearance themes to gradient presets
- [x] Update desktop helper to stable 6.0.0 with version/channel/protocol reporting
- [x] Improve helper connection errors and initial reconnect behavior
- [x] Publish stable V6.0.0 release and migration notes

## Next V6 updates

- [ ] Add theme import/export
- [ ] Finish compact-layout polish
- [ ] Add more accessibility options
- [ ] Test upgrades on more Windows/browser combinations
- [ ] Continue improving plain-English errors for uncommon failures
- [ ] Add true automatic helper-update installation

## Browser-store work

- [x] Remove `<all_urls>` from required install-time host permissions
- [x] Move changing third-party player-frame access behind an optional user-granted permission
- [ ] Verify the optional player permission flow in Opera, Chrome and Edge store-style installs
- [ ] Finalize privacy policy against actual production behavior
- [ ] Create store screenshots and promotional artwork
- [ ] Publish first Chrome Web Store / Edge Add-ons test listing
- [ ] Record Chrome / Edge production extension IDs
- [ ] Add production IDs to the helper allowlist
- [ ] Add browser-store install buttons to the website

## Desktop distribution work

- [ ] Sign the desktop-helper installer/executable
- [ ] Add a smoother one-click update experience for the helper
- [ ] Test installer/uninstaller on clean Windows accounts

V6.0.0 is the current stable GitHub release. V5 stays available as the legacy fallback build.
