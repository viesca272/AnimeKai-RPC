# AnimeKai RPC V6.1.2

V6.1.2 is a small visual-polish release for Rich Presence branding.

## AnimeKai artwork

The browsing presence now uses the actual AnimeKai artwork supplied for this release instead of the generic AnimeKai RPC extension icon.

When you are browsing AnimeKai, Discord now shows:

- **Browsing AnimeKai**
- **Finding something to watch** or **Searching for something to watch**
- the actual AnimeKai artwork as the large image
- browsing elapsed time when timestamps are enabled

## Watching presence

While an episode is playing:

- the anime cover remains the large Rich Presence image
- AnimeKai branding is added as the small image with the text **Watching on AnimeKai**
- if Discord rejects the small branding image for any reason, AnimeKai RPC automatically retries with the anime cover only instead of dropping the cover art entirely

## Everything else stays the same

V6.1.2 keeps the V6.1 browsing states, faster event-first detection, detailed health check, gradient presets, Repair App, and protocol v3 helper behavior.

## Upgrade

1. Download `AnimeKai-RPC-V6.1.2-Windows.zip`.
2. Extract it and run **Install AnimeKai RPC.cmd**.
3. Replace the older unpacked extension with the V6.1.2 `extension` folder.
4. Refresh any already-open AnimeKai tabs.

**Made by viesca27**
