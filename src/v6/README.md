# AnimeKai RPC V6

**Status:** Alpha 4 — active testing  
**Made by viesca27**

V6 keeps the playback detection and Discord RPC path that proved stable in V4.2.3/V5, while making setup feel much closer to a normal browser extension + companion app.

## What's in Alpha 4

- Built-in public Discord Application ID — users do not need to create or enter one
- V5-style extension icon in the browser toolbar and Extensions page
- Refresh / reconnect button for Discord RPC and AnimeKai detection
- First-run setup page with plain-English status checks
- Required host access is now limited to AnimeKai + the artwork provider
- Broad cross-origin player access moved to an **optional** permission that is requested only when the user enables embedded-player detection
- Dynamic player-frame script registration after permission is granted
- Popup now shows whether player access is enabled and whether the desktop helper is missing or outdated
- Direct **Install / Update Helper** path from the popup and setup guide
- One-click **Repair App** with Native Messaging and Discord reconnect checks
- Appearance controls including accent color, theme mode, compact layout and reduced motion
- Alternate anime cover lookup through Jikan with a 7-day local cache
- Real cover retry behavior instead of a generic fallback image

## Why does player detection ask for optional site access?

AnimeKai can load its video player inside third-party frames, and those video-host domains may change. Alpha 4 no longer asks for broad access as a required install permission.

Instead, the setup guide explains the reason and lets the user enable that access explicitly. The content script checks whether the frame belongs to an AnimeKai page and exits immediately when it does not.

Without the optional player permission, AnimeKai title/episode detection can still work on the AnimeKai page, but playback state and timestamps may stay in a limited/waiting state depending on the embedded player.

## Still being worked on

- Chrome Web Store / Edge Add-ons production IDs in the native-host allowlist
- Signed desktop-helper installer
- True automatic helper updating instead of the current guided update button
- Theme presets, import/export and compact layout polish
- Store screenshots, listing copy and final privacy-policy review
- Testing clean installs and upgrades across Opera, Chrome and Edge

## Testing

V6 is still a prerelease. V5 remains the stable release while Alpha 4 is tested.

For Alpha 4, please test both a clean install and an upgrade from Alpha 3. The main things to verify are:

1. the first-run setup page opens correctly,
2. enabling player detection restores full play/pause/timestamp tracking,
3. the helper is detected after installation,
4. Discord Rich Presence still appears normally,
5. the extension no longer requires `<all_urls>` during the initial install.

The development build still uses the pinned V5/V6 extension ID so the existing native-host registration continues to work during testing.
