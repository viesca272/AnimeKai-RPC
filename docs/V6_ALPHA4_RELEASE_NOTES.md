# AnimeKai RPC V6 Alpha 4

Alpha 4 is mainly about making V6 feel less like a developer tool and more like something a normal person can install and understand.

## What's new

- Added a proper **first-run setup page**.
- The public AnimeKai RPC Discord Application ID is still built in — no Discord Developer Portal setup is required.
- Removed `<all_urls>` from the extension's required install-time host permissions.
- Full third-party player-frame access is now an **optional permission** that the user enables from the setup guide or popup.
- The extension dynamically registers the cross-origin player detector only after that permission is granted.
- Added a safety guard so the player detector does not initialize twice when both AnimeKai and dynamic frame injection apply.
- Added **Player detection** status to the popup.
- Added **Desktop helper** version status to the popup.
- Added direct **Install / Update Helper** and **Setup guide** buttons.
- Improved installer wording so users know exactly what to do after the helper is installed.
- Updated privacy information to explain embedded-player access and Jikan artwork lookups.
- Kept the V5-style extension icon, Alpha 3 bundled Discord app, Refresh button, Repair App, appearance controls, and cover recovery.

## Why the optional player permission exists

AnimeKai can load its video player from changing third-party domains. A fixed list of hosts is likely to break whenever AnimeKai changes video providers.

Alpha 4 therefore uses two levels of access:

1. AnimeKai itself is allowed by default so title, episode and page information can be detected.
2. Third-party frame access is requested only when the user explicitly enables **Player detection**. This is what allows play/pause/buffering/timestamp detection inside embedded players.

The content script checks whether a frame is part of an AnimeKai page and exits immediately when it is not.

## Installing Alpha 4

1. Download `AnimeKai-RPC-V6.0.0-alpha.4-Windows.zip`.
2. Extract it somewhere permanent.
3. Run `Install AnimeKai RPC.cmd`.
4. Remove or disable the older V6 test extension.
5. Load Alpha 4's `extension` folder as an unpacked extension.
6. The first-run setup page should open automatically.
7. Click **Enable player detection** and approve the optional browser permission.
8. Click **Check again** after the Windows helper is installed.
9. Open AnimeKai and start an episode.

If Discord does not appear immediately, open the popup and press **↻ Refresh** once.

## What to test

Please pay extra attention to:

- whether the first-run page opens,
- whether the optional player permission can be enabled cleanly,
- whether play/pause/timestamps still work after permission is granted,
- whether the helper shows as the correct Alpha 4 version,
- whether the popup correctly notices a missing or older helper,
- whether Discord Rich Presence behaves the same as Alpha 3 once setup is complete.

V5 remains the stable release while V6 is being tested.

**Made by viesca27**
