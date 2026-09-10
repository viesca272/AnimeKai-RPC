# AnimeKai RPC V6.0.0

V6 is the official stable release of AnimeKai RPC.

This release rolls together the features tested across the V6 alpha builds while keeping the playback and Discord RPC path that proved reliable in V5.

## Highlights

- Built-in AnimeKai RPC Discord Application ID — users do not need to create or configure their own Discord application.
- Automatic AnimeKai title, episode, playback-state, and timestamp detection.
- Updated V6.0.0 Windows desktop helper with clearer errors, connection retry, stable version/channel/protocol reporting, install metadata, and repair support.
- First-run setup page with helper status and Player detection setup.
- `<all_urls>` is not a required install-time host permission; access to changing third-party embedded players is requested only when the user enables Player detection.
- Refresh / reconnect button for quickly resending the current AnimeKai state to Discord.
- One-click Repair App for Native Messaging registration, helper setup, local configuration, and Discord reconnect checks.
- Alternate anime cover lookup through Jikan with local caching.
- Clean text-only Discord presence if artwork cannot be used.
- V5-style AnimeKai RPC extension icon.

## Gradient appearance presets

The flat Alpha 5 presets have been upgraded into gradient presets for the stable release:

- **AnimeKai Aurora** — deep purple into violet
- **Borealis** — ocean teal into aurora green
- **Charcoal** — black into graphite gray
- **Midnight** — near-black navy into deep blue
- **Sakura** — dark plum into cherry pink
- **Ember** — near-black brown into burnt orange

Users can still choose exact custom accent, popup background, and card colors. Manual background/card changes switch to a flat Custom appearance.

## Desktop helper 6.0.0

The helper now reports its stable channel and protocol version to the extension, retries the first Discord connection once before failing, and translates some low-level connection errors into clearer instructions.

The installer also writes `%LOCALAPPDATA%\AnimeKaiRPC\install-info.json` to make version/path troubleshooting easier. Normal upgrades preserve existing RPC preferences and preserve any additional Native Messaging extension origins that were already registered.

## Installing V6

1. Download `AnimeKai-RPC-V6.0.0-Windows.zip` from this release.
2. Extract it somewhere permanent.
3. Run `Install AnimeKai RPC.cmd`.
4. Until the browser-store listings are live, load the included `extension` folder from your Chromium browser's Extensions page.
5. Open the AnimeKai RPC setup guide and enable **Player detection** when prompted.
6. Open AnimeKai and play an episode.
7. If Discord does not update immediately, press **↻ Refresh** in the extension popup.

No Discord Application ID setup is required.

## Upgrading from V5 or a V6 alpha

Running the V6.0.0 helper installer refreshes the desktop helper and Native Messaging registration while preserving normal RPC preferences. Browser-side appearance settings are stored separately by the extension.

Disable/remove the older unpacked extension and load the V6.0.0 `extension` folder.

## Browser-store status

V6.0.0 is the official stable GitHub release, but Chrome Web Store and Microsoft Edge Add-ons publishing is still being finalized. The current GitHub package therefore still uses the unpacked extension installation flow.

V5 remains available as a legacy fallback release.

**Made by viesca27**
