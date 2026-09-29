# V7 store preparation

V7 alpha is an unpacked Windows prerelease. It has not been submitted to or approved by an extension store.

## Permission explanations

| Permission | Why V7 uses it |
| --- | --- |
| nativeMessaging | Connect the installed local helper to Discord desktop. |
| storage | Keep preferences, site toggles, and cached cover URLs locally. |
| tabs | Refresh supported tabs and associate playback with the correct top-level site. |
| scripting | Inject packaged detectors after updates and register optional player-frame detection. |
| webNavigation | Check actual parent frames/document identities and discard stale or unrelated embedded players. |
| Exact AnimeKai, AnimePahe, and 9anime host permissions | Read title, episode, poster, and player metadata from those pages. The manifest currently requests all three sites even if a site toggle is off. |
| api.jikan.moe | Look up replacement covers using an anime title when necessary. |
| Optional `<all_urls>` | Inspect changing third-party player domains. Granted from a user gesture. Background validation requires an enabled, recognized site and an approved player subtree. |

Scripts are packaged with the extension; no remote executable code or cloud chatbot is included. Guided-help questions stay in memory on the help page. Playback metadata goes to the local helper and then Discord. Jikan receives a title query for replacement artwork; image hosts receive image requests. Diagnostics do not include account credentials.

Before submission: minimize/audit permissions against live behavior, decide per-site optional permissions, complete live testing, set production extension IDs/allowlists, check privacy disclosures, prepare accurate screenshots/listings, review third-party artwork rights, sign/distribute the Windows helper, and verify installation/rollback. Public availability of a logo does not establish redistribution rights or official affiliation.

Artwork sources are recorded in `src/v7/artwork/sources.json`. The browsing files are 512×512 PNGs with padded content; playback badges are transparent 256×256 PNGs. This preparation is intended for Discord thumbnails. Actual remote fetches/crops and store rights review remain pending.
