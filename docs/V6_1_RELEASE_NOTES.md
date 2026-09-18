# AnimeKai RPC V6.1.0

V6.1 is a polish release focused on making AnimeKai RPC feel faster and more complete without making setup more complicated.

## Browsing presence

AnimeKai RPC now appears in Discord as soon as AnimeKai is opened, even before an episode starts.

The default browsing presence is:

- **Browsing AnimeKai**
- **Finding something to watch**
- AnimeKai RPC artwork as the large image
- elapsed browsing time when timestamps are enabled
- an **Open AnimeKai** button

Search pages use **Searching for something to watch**.

When an episode is opened, the existing anime title / episode / playback presence takes over automatically. Returning to normal browsing switches back to the browsing presence.

## Faster detection

V6.1 makes detection event-first instead of relying mainly on the safety heartbeat.

- AnimeKai content detection now starts at `document_start`.
- Opening an AnimeKai tab primes the browsing RPC immediately from the extension background worker.
- Page route changes are detected through History API, popstate, hash changes, and DOM changes.
- Short startup bursts run at roughly 0 ms, 180 ms, 500 ms, and 1100 ms after a route/player change.
- Video events such as play, pause, playing, waiting, seeking, duration changes, and metadata changes push updates immediately.
- The slower periodic heartbeat remains only as a safety fallback.
- Stale player-frame state is cleared when AnimeKai changes routes.
- Appearance-only changes no longer unnecessarily reconfigure/reconnect the desktop RPC helper.

## Health check polish

The **Run health check** button now has a real Checking state and reports the individual checks instead of only a single overall result.

It checks:

- desktop helper connection
- Native Messaging manifest
- browser registration
- local configuration
- install metadata
- bundled Discord application configuration
- Discord desktop connection
- Player detection permission

A healthy installation with Discord closed is shown separately from a broken installation.

If the desktop helper does not answer the request, the popup now reports that instead of silently appearing successful.

## Desktop helper 6.1.0

The stable desktop helper has been updated to **6.1.0** with protocol version 3.

Changes include:

- native browsing-presence support
- AnimeKai RPC artwork for browsing
- browsing elapsed timer
- better health snapshot validation
- Native Messaging manifest validation
- separate installation-health and Discord-runtime status
- reduced unnecessary Discord reconnects when configuration has not actually changed
- existing V6 repair and preference-preservation behavior retained

## Appearance

The V6 gradient presets remain unchanged:

- AnimeKai Aurora
- Borealis
- Charcoal
- Midnight
- Sakura
- Ember

V6.1 deliberately keeps the scope focused on polish rather than adding more appearance complexity.

## Installing / upgrading

1. Download `AnimeKai-RPC-V6.1.0-Windows.zip`.
2. Extract it somewhere permanent.
3. Run **Install AnimeKai RPC.cmd** to update the desktop helper.
4. Replace the older unpacked extension with the V6.1.0 `extension` folder.
5. Keep **Player detection** enabled from the setup guide.
6. Open AnimeKai.

You should now see the browsing RPC almost immediately, followed by the normal episode presence when playback begins.

**Made by viesca27**
