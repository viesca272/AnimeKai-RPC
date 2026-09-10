# AnimeKai RPC

**Watch on AnimeKai. Let Discord handle the rest.**

AnimeKai RPC automatically shows what you're watching on AnimeKai as Discord Rich Presence. Once the browser extension and Windows helper are installed, you can open an episode and just watch — the title, episode, playback state, timer, and artwork update in Discord for you.

**Made by viesca27**

---

## V6 is now the official release

AnimeKai RPC **V6.0.0** is the current stable version.

V6 rolls together everything that was tested across the V6 alpha builds while keeping the playback/RPC path that proved reliable in V5.

What you get in V6:

- automatic AnimeKai title and episode detection
- play, pause, buffering, and timestamp tracking
- Discord Rich Presence with the public AnimeKai RPC application already configured
- a small Windows desktop helper for Discord communication
- **Refresh** / reconnect controls
- one-click **Repair App**
- first-run setup and helper-version checks
- optional embedded-player access instead of requiring broad site access during install
- alternate cover-art recovery through Jikan with local caching
- the familiar V5 browser-extension icon
- appearance customization with custom colors and gradient presets

### Gradient appearance presets

V6 includes six built-in gradient themes:

- **AnimeKai Aurora** — the purple default
- **Borealis** — teal / aqua
- **Charcoal** — dark neutral gray
- **Midnight** — deep navy / blue
- **Sakura** — plum / pink
- **Ember** — brown / orange

You can also choose your own accent, popup background, and card colors. Custom color choices are saved locally.

## What happened to V5?

V5 is still available in Releases as the legacy stable build and a useful fallback if somebody runs into a V6-specific issue. New installs should use V6.

## How it works

```text
AnimeKai in your browser
        ↓
AnimeKai RPC extension
        ↓
Local Windows helper
        ↓
Discord Rich Presence
```

The extension handles AnimeKai detection. The Windows helper handles the local connection to the Discord desktop app. Discord credentials are not required, and the Rich Presence connection does not need a cloud server.

## Installing V6

1. Open the latest GitHub Release and download **AnimeKai-RPC-V6.0.0-Windows.zip**.
2. Extract the ZIP somewhere permanent.
3. Run **Install AnimeKai RPC.cmd**.
4. Load the included `extension` folder in your Chromium-based browser while browser-store publishing is being finalized.
5. Open the V6 setup guide and enable **Player detection** when prompted.
6. Open AnimeKai, start an episode, and press **Refresh** once if Discord does not appear immediately.

The Discord Application ID is already built in. You do **not** need to create a Discord application or paste an ID anywhere.

## Why does Player detection ask for optional site access?

AnimeKai can load its video player from changing third-party domains. V6 keeps broad cross-origin frame access out of the extension's required install permissions and asks for it only when you explicitly enable **Player detection**.

That permission is used to detect playback inside AnimeKai's embedded player frames. The detector checks whether a frame is part of an AnimeKai page and exits when it is not.

## Repair App

If the connection gets weird, **Repair App** is meant to be the first thing you try.

It checks the desktop helper, Native Messaging manifest, Chrome / Chromium / Edge registry entries, local configuration, and Discord RPC connection. Normal repairs preserve your personal appearance settings and RPC preferences.

## Better cover artwork

V6 uses the cover from AnimeKai when possible. If that cover is missing or rejected by Discord, the extension can search Jikan for another matching anime poster, cache the result locally, and resend the Rich Presence.

If no usable image is available, the RPC can fall back to a clean text-only presence instead of showing a random generic image.

## Desktop helper

V6.0.0 includes an updated stable helper with:

- the bundled AnimeKai RPC Discord Application ID
- clearer connection errors
- a second Discord connection attempt before reporting failure
- stable helper/version reporting to the extension
- improved health-check information
- repair support for Native Messaging registration
- an `install-info.json` record for easier troubleshooting
- upgrade behavior that preserves existing V5/V6 RPC preferences

The helper installs under `%LOCALAPPDATA%\AnimeKaiRPC` and starts automatically when the extension connects to it. It does not need to sit open as a separate server window all day.

## Browser-store progress

V6 is structured for Chrome Web Store and Microsoft Edge Add-ons distribution. The remaining store work is mainly publishing/configuration: final production extension IDs, helper allowlisting for those IDs, store artwork/screenshots, and final review of the privacy disclosure.

Until the store listings are live, the GitHub V6 package uses the unpacked extension flow.

## Found a bug or have an idea?

Use the GitHub issue forms:

- [Report a bug](https://github.com/viesca272/AnimeKai-RPC/issues/new/choose)
- [Request a feature](https://github.com/viesca272/AnimeKai-RPC/issues/new/choose)

If you're reporting a connection problem, use **Copy diagnostics** in the extension and include the result. It makes troubleshooting much faster.

## Privacy

AnimeKai RPC does **not** need your Discord password, Discord user token, bot token, or client secret.

The Discord Application ID included with the project is a public identifier used for Rich Presence. Local settings are stored on your machine/browser. V6 may contact Jikan when it needs to find replacement anime artwork.

See [privacy.html](privacy.html) for the current privacy information.

## Project website

The project site contains install help, troubleshooting, changelog notes, and V6 information:

https://viesca272.github.io/AnimeKai-RPC/

## License

See [LICENSE](LICENSE).

---

Thanks for using AnimeKai RPC.

**Made by viesca27**
