# AnimeKai RPC V6

**Status:** Alpha 1 — active development  
**Made by viesca27**

V6 keeps the playback detection and Discord RPC path that proved stable in V4.2.3/V5, then adds the things needed for a friendlier public release.

## Already in this alpha

- V5 playback detection carried forward instead of rewritten
- New V6 popup with accent color picker and appearance settings
- One-click **Repair App** request from the extension
- Native-helper health checks and Windows Native Messaging repair logic
- Alternate anime cover lookup through Jikan with a 7-day local cache
- If cover art is rejected, Discord falls back to text-only presence while V6 searches for another poster — no generic backup image
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

This is development source, not the recommended public build yet. V5 remains the stable baseline while V6 is tested.

The current extension uses the same pinned development extension ID as V5 so the existing native-host registration can continue to work during development.
