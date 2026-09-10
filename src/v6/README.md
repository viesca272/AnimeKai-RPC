# AnimeKai RPC V6

**Status:** Alpha 5 — active testing  
**Made by viesca27**

V6 keeps the playback detection and Discord RPC path that proved stable in V4.2.3/V5, while making setup and customization feel much closer to a normal browser extension + companion app.

## What's in Alpha 5

- Built-in public Discord Application ID — users do not need to create or enter one
- V5-style extension icon in the browser toolbar and Extensions page
- Refresh / reconnect button for Discord RPC and AnimeKai detection
- First-run setup page with plain-English status checks
- Required host access limited to AnimeKai + the artwork provider
- Broad cross-origin player access kept behind an optional permission that is requested only when the user enables embedded-player detection
- Popup status for player access and desktop-helper version
- Direct **Install / Update Helper** path from the popup and setup guide
- One-click **Repair App** with Native Messaging and Discord reconnect checks
- Expanded Appearance controls with custom accent, popup background and card colors
- Built-in theme presets: **AnimeKai, Borealis, Charcoal, Midnight, Sakura and Ember**
- Presets and custom colors are saved locally and survive normal helper repair/reinstall flows
- Alternate anime cover lookup through Jikan with a 7-day local cache
- Real cover retry behavior instead of a generic fallback image

## Appearance presets

Alpha 5 adds a quick way to completely change the look of the extension popup without touching any RPC settings.

The default **AnimeKai** preset keeps the purple V5/V6 look. **Borealis** uses a dark teal palette, **Charcoal** stays neutral and low-key, **Midnight** leans deep blue, **Sakura** uses a dark pink palette, and **Ember** uses warm orange/brown tones.

Users can also make their own theme by changing the accent, background and card colors individually. Any manual color change switches the appearance label to **Custom**.

## Why does player detection ask for optional site access?

AnimeKai can load its video player inside third-party frames, and those video-host domains may change. V6 no longer asks for broad access as a required install permission.

Instead, the setup guide explains the reason and lets the user enable that access explicitly. The content script checks whether the frame belongs to an AnimeKai page and exits immediately when it does not.

Without the optional player permission, AnimeKai title/episode detection can still work on the AnimeKai page, but playback state and timestamps may stay in a limited/waiting state depending on the embedded player.

## Still being worked on

- Chrome Web Store / Edge Add-ons production IDs in the native-host allowlist
- Signed desktop-helper installer
- True automatic helper updating instead of the current guided update button
- Theme import/export and compact-layout polish
- More accessibility options
- Store screenshots, listing copy and final privacy-policy review
- Testing clean installs and upgrades across Opera, Chrome and Edge

## Testing

V6 is still a prerelease. V5 remains the stable release while Alpha 5 is tested.

For Alpha 5, please test the normal AnimeKai/Discord flow plus the appearance system. Try switching between presets, changing each color manually, closing/reopening the popup, and reinstalling the helper to make sure the chosen appearance stays intact.

The development build still uses the pinned V5/V6 extension ID so the existing native-host registration continues to work during testing.
