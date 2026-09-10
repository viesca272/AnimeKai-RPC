# AnimeKai RPC V6

**Status:** Alpha 3 — active testing  
**Made by viesca27**

V6 keeps the playback detection and Discord RPC path that proved stable in V4.2.3/V5, then layers on the things needed for a much friendlier public release.

## What's in Alpha 3

- V5 playback detection carried forward instead of rewritten
- Built-in public Discord Application ID, so users no longer need to create or enter one
- Restored V5-style extension icon in the browser toolbar and Extensions page
- Refresh / reconnect button for Discord RPC and AnimeKai detection
- New V6 popup with accent color picker and appearance settings
- One-click **Repair App** request from the extension
- Native-helper health checks and Windows Native Messaging repair logic
- Alternate anime cover lookup through Jikan with a 7-day local cache
- If cover art is rejected, Discord falls back to text-only presence while V6 searches for another real poster — no generic backup image
- GitHub release/support/site links wired to this repository

## Still being worked on

- Store-permission hardening, especially reducing the broad iframe permission used by the current player detector
- Chrome Web Store / Edge Add-ons production IDs in the native-host allowlist
- Signed desktop-helper installer
- Helper auto-update flow
- Better first-run onboarding
- Theme presets, import/export, compact layout polish and accessibility options
- Store screenshots, listing copy and final privacy-policy review

## Testing

V6 is still a prerelease. V5 remains the stable baseline while Alpha 3 is tested.

The current extension uses the same pinned development extension ID as V5 so the existing native-host registration can continue to work during development.
