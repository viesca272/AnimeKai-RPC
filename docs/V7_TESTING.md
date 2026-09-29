# V7 alpha 1 test record

**Status: prerelease — still needs live checking.** Automated fixtures demonstrate specific behavior; they do not establish live support for a site.

## Results from this run

- 16 JavaScript checks and 12 Python helper tests passed locally and on the Windows runner.
- [Windows VM run](https://github.com/viesca272/AnimeKai-RPC/actions/runs/36506137871): passed installation, upgrade, repair, registry, packaging, and compiled-helper Native Messaging checks. Discord was unavailable as expected.
- Chromium UI recording checks cover playing/paused/seek display, three browsing covers, site opt-in, appearance changes, FAQ matching/fallback, escaped input, onboarding, and browser errors. Playback and Chrome APIs are simulated.

## Repeatable checks

```sh
npm ci
python -m pip install -r tools/requirements-v7.txt
python tools/build-v7-artwork.py
npm run check
npm test
python -m unittest discover -s tests/v7 -p test_host.py -v
```

The V7 GitHub Actions workflow runs these checks on a Windows VM, compiles the native helper with PyInstaller, builds both ZIPs, and tests installation, upgrade preference retention, repair, browser registry entries, and framed health requests against the compiled executable. The health test expects Discord to be unavailable and requires installation health to pass. Publication depends on those checks.

Local UI checks use Chromium 138 in a Linux container with mocked Chrome extension APIs. The demo shows the real V7 popup/help HTML and scripts consuming simulated playback state. It is not an end-to-end browser-extension or Discord recording.

## Covered by automated tests

- Exact supported domains; unknown metadata and fractional episode numbers.
- Separate site adapters, provisional watch-page fixtures, scoped poster/player selection, and series-page versus playback-page detection.
- Playing, paused, buffering, ended, non-finite clocks, and stable multi-tab selection.
- Frame identity, ancestry, approved player roots, unrelated ad rejection, navigation cleanup, and experimental-site opt-in.
- Revoked player permission, sharing off, explicit Clear/Refresh behavior, and replacement-cover persistence.
- Discord payload construction, black badge URLs, paused timers, seeking, site-specific browsing art, invalid site rejection, and artwork fallback.
- Fragmented/oversized native messages, older BOM settings, and preserved helper registrations.

## Manual release gate — all still open

- [ ] Install the unpacked extension and matching helper in Chrome on a normal Windows PC; repeat in Edge and Opera.
- [ ] Verify browsing → watch → pause → resume → seek → buffering → episode change → ended for each site.
- [ ] Check each current embedded player, fullscreen/player replacement, SPA navigation, ads, redirects, tab close, and multiple simultaneous sites.
- [ ] Deny, grant, revoke, and regrant Player detection in a real browser; confirm unaffected browsing and stopped frame publishing.
- [ ] Verify Discord desktop title, episode, totals, timers, black badges, site covers, anime covers, and image crops/fallbacks.
- [ ] Close/reopen Discord, restart the browser, upgrade from V6, repair, uninstall, and roll back.
- [ ] Audit store permissions, artwork rights, privacy text, production extension IDs, screenshots, accessibility, and listing claims before submission.

No signed-in Discord account or interactive Windows desktop was available for this run. Direct site requests were blocked, and live playback was not verified. Do not mark these items complete based on the demo or unit tests.

## Presence policy

Playing wins over buffering, paused, ended, waiting, and browsing. Equal-ranked tabs retain the previous selection before preferring the active tab. Frame media older than 20 seconds is discarded; the next poll normally marks an existing watch page as waiting. Closing/leaving all supported enabled tabs clears presence. Ending an episode shows Finished until navigation or another tab takes priority. Clear suppresses sharing until Refresh; the sharing toggle is persistent.

## Reproduce the UI recording

With Playwright, a Chromium executable, and ffmpeg available, run `node tools/demo-v7.cjs`. Optional environment variables: `CHROMIUM_EXECUTABLE`, `DEMO_OUTPUT`, and `DEMO_COVER` (a local sample cover file). Output is a labeled MP4 plus `ui-checks.json`; no demo code is included in the release extension. The demo uses a local HTTP server and blocks external browser requests.

The recorded sample uses the Frieren poster at https://cdn.myanimelist.net/images/anime/1015/138006.jpg, downloaded solely as a demo fixture. It is not bundled with the extension. Site-artwork sources are recorded separately in `src/v7/artwork/sources.json`.
