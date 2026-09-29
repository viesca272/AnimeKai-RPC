# Anime-RPC V7 alpha 1 — STILL NEEDS CHECKING

**This is a prerelease, not a fully verified stable release.** Use V6.1.6 for the existing stable AnimeKai version. Live site playback, real Discord rendering, and a normal user's complete Windows/browser setup still need checking.

## Included

- Anime-RPC branding in the extension, helper installer, and help pages.
- Separate AnimeKai, AnimePahe, and `9animehd.live` detection modules with shared playback data. AnimePahe and 9anime are experimental and disabled until enabled in Sites.
- Stable selection between tabs: playing first, retain the current tab on a tie, then prefer the active tab. Browsing cannot replace a playing episode.
- Browser frame-tree checks for embedded players, navigation cleanup, and optional player permission handling.
- Site-specific browsing images, anime covers while watching, replacement-cover caching, and black play/pause circles with white symbols.
- Playback-clock-based timers that reset after a seek, plus paused, buffering, ended, and waiting states.
- Local guided FAQ help, clearer diagnostics, per-site controls, and sharing on/off.
- A Windows helper and installer that retain V6 identities/preferences, preserve browser registrations during repair, and correctly read older UTF-8 BOM configuration files.

## Downloads

Use **Anime-RPC-Windows-v7.0.0-alpha.1.zip** for the complete Windows installation. The extension-only ZIP requires the matching helper. SHA256SUMS.txt covers the packaged ZIPs and public artwork assets.

See the [install guide](https://github.com/viesca272/AnimeKai-RPC/blob/main/docs/V7_INSTALL.md), [test record](https://github.com/viesca272/AnimeKai-RPC/blob/main/docs/V7_TESTING.md), [FAQ](https://viesca272.github.io/AnimeKai-RPC/faq.html), and [roadmap](https://github.com/viesca272/AnimeKai-RPC/blob/main/docs/V7_ROADMAP.md).

## Validation and remaining work

Automated checks cover adapter fixtures, playback selection, frame validation, navigation, permissions, cover persistence, native messages, helper payloads, and Windows packaging/install/repair. Browser UI checks use simulated extension/Discord state. The recorded demo is labeled accordingly.

**Not verified:** real logged-in Discord Rich Presence, live video detection on all three sites, actual Discord image fetching/cropping, full Chrome/Edge/Opera installation flows, or store acceptance. The Windows Actions VM checks the installer and packaged helper without a Discord session. Site blocking prevented complete live inspection; adapter selectors are provisional.

The repository URL remains `AnimeKai-RPC` while the project is branded Anime-RPC. Repository and Discord application display-name changes remain pending. Store submission, signed installer distribution, external AI chat, and additional operating systems are not included.

V6.1.6 remains stable, including the earlier **soft update** that changed its playback badges to black without a version bump.
