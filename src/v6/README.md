# AnimeKai RPC V6

**Status:** Stable — 6.0.0  
**Made by viesca27**

V6.0.0 is the official AnimeKai RPC release. It keeps the playback/RPC path proven by V5 and rolls in the setup, repair, artwork, permission, and appearance work tested throughout the V6 alpha builds.

## Included in V6.0.0

- Built-in public Discord Application ID — no Discord developer setup required
- V5-style extension icon
- Refresh / reconnect control
- First-run setup guide
- Required host access limited to AnimeKai + Jikan
- Optional third-party player-frame access for embedded playback detection
- Desktop-helper version/status checks
- Install / Update Helper links
- One-click **Repair App**
- Alternate anime cover lookup with a 7-day local cache
- Text-only RPC fallback if artwork cannot be used
- Custom accent, popup background, and card colors
- Six gradient appearance presets
- Dark, light, and system text modes
- Compact layout and reduced-motion options

## Gradient presets

The official V6 presets use gradients instead of flat backgrounds:

- **AnimeKai Aurora** — deep purple into violet
- **Borealis** — dark ocean teal into aurora green
- **Charcoal** — black into graphite gray
- **Midnight** — near-black navy into deep blue
- **Sakura** — dark plum into cherry pink
- **Ember** — near-black brown into burnt orange

Manual background/card color changes switch the appearance to a flat **Custom** theme so users can choose exact colors without fighting the preset gradient.

## Desktop helper 6.0.0

The stable helper now reports its version, release channel, and protocol version back to the extension. It also has clearer Discord connection errors, retries the initial Discord connection once, records install metadata, and keeps the existing Repair App behavior.

The Windows installer preserves existing V5/V6 RPC preferences and any already-added extension origins in the Native Messaging manifest while upgrading the helper.

## Player permission

AnimeKai may embed video from changing third-party hosts. V6 therefore keeps `<all_urls>` out of required install-time host permissions and asks for broad frame access only when the user explicitly enables **Player detection**.

The detector verifies that the frame belongs to an AnimeKai page and exits when it does not.

## Current store work

The code is prepared for browser-store distribution, but the unpacked GitHub build remains the current installation method until the store listings are published. The remaining work is mainly production extension IDs/allowlisting, store screenshots/listing assets, signing the Windows helper installer, and final privacy-review details.

V5 remains available as a legacy fallback release.
