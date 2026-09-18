# AnimeKai RPC V6.1.1

V6.1.1 is a small hotfix for the V6.1 polish release.

## Fixed

- Fixed an invalid search-page regular expression in `background.js`.
- The bad expression could prevent the Manifest V3 background service worker from registering and show:
  - `Service worker registration failed. Status code: 15`
  - `Uncaught SyntaxError: Invalid regular expression flags`
- `Extension context invalidated` may appear after reloading an older broken unpacked build; reload the fixed extension and refresh the AnimeKai tab to clear the stale context.

## V6.1 features retained

- Browsing AnimeKai presence with AnimeKai RPC artwork
- Faster event-first detection
- Search/browsing status transitions
- Detailed health checks
- Gradient appearance presets
- Desktop helper protocol v3

No intentional feature behavior changed from V6.1.0.

**Made by viesca27**
