# AnimeKai RPC

**Watch on AnimeKai. Let Discord handle the rest.**

AnimeKai RPC is a small Windows + browser project that automatically shows what you're watching on AnimeKai as Discord Rich Presence.

**Made by viesca27**

---

## What does it do?

Once everything is installed, you can just open AnimeKai and start watching. AnimeKai RPC handles the Discord presence in the background.

It can show:

- anime title
- current episode and total episodes
- playing, paused, and buffering status
- elapsed / remaining watch time
- cover artwork
- a button back to AnimeKai

There is no need to manually change your Discord status every episode.

## Current versions

### V5 — Stable

V5 is the version to use if you just want AnimeKai RPC working right now. It uses the stable playback detection and local Discord RPC setup that the project was built around.

### V6 Alpha 5 — Testing

V6 Alpha 5 is the current test build in [`src/v6`](src/v6).

The goal of V6 is to make AnimeKai RPC feel like a normal app that someone can install without needing to know how Native Messaging or Discord Rich Presence works.

Alpha 5 currently includes:

- built-in Discord Application ID — no Discord developer setup required
- first-run setup guide
- optional embedded-player permission instead of requiring broad site access at install time
- helper install/update status directly in the popup
- one-click **Repair App**
- custom accent, popup background, and card colors
- six built-in themes: **AnimeKai, Borealis, Charcoal, Midnight, Sakura, and Ember**
- better cover-art recovery and local caching
- no generic backup image when a cover fails
- clearer diagnostics and error messages
- the V5-style browser extension icon

V6 is still a prerelease, so V5 remains the recommended stable download while Alpha 5 is tested.

You can follow development in the [V6 roadmap](docs/V6_ROADMAP.md).

## How does it work?

AnimeKai RPC is made of two parts:

```text
AnimeKai in your browser
        ↓
AnimeKai RPC extension
        ↓
Local Windows helper
        ↓
Discord Rich Presence
```

The browser extension detects the anime and playback state. The Windows helper then talks to the Discord desktop app.

The helper is necessary because Chromium extensions cannot directly access Discord's local IPC connection. The Rich Presence itself does **not** require a cloud server.

## V6 setup

V6 automatically includes the project's public Discord Application ID, so users do not need to create their own Discord application.

AnimeKai sometimes loads video inside third-party frames. V6 asks for that broader player access only when the user chooses **Enable player detection** in the setup guide or popup. The extension's player detector checks that the frame belongs to an AnimeKai page before doing anything.

The Windows helper is still required. The popup tells you if it is missing or on an older version and links directly to the matching V6 release.

## Repair App

Instead of making users dig through folders or registry entries, **Repair App** checks things like:

- desktop helper installation
- Native Messaging manifest
- Opera / Chrome / Edge registration
- extension-to-helper connection
- Discord RPC connection
- local configuration

If something can be safely fixed automatically, the app fixes it and explains what happened. Personal themes and settings are kept during a normal repair.

## Better cover artwork

V6 first tries to use the cover provided by AnimeKai.

If that image is missing or broken, the extension can look for another matching anime poster from an anime metadata provider and cache the result locally. The goal is to keep a real anime cover in Discord instead of falling back to a generic placeholder.

## Customization

Alpha 5 expands the Appearance section quite a bit. You can change the accent color, the main popup background, and the card/background panels independently.

If you do not feel like building a theme from scratch, there are premade presets:

- **AnimeKai** — the default purple look
- **Borealis** — dark teal with a mint accent
- **Charcoal** — neutral gray
- **Midnight** — deep navy / blue
- **Sakura** — dark pink / plum
- **Ember** — warm brown / orange

The dark, light, and system text modes are still available, along with compact layout and reduced motion. Custom colors are saved locally so they stay put when you close the browser or repair/reinstall the helper.

Theme import/export is planned for a later V6 build.

## Installation

### Stable V5

Use the latest stable GitHub Release if you want the most proven build.

### V6 testing

Download the newest V6 prerelease Windows ZIP, extract it, run **Install AnimeKai RPC.cmd**, then load the included `extension` folder as an unpacked extension while V6 is still in testing.

On a fresh V6 install, the extension opens a setup page that walks through player access and the desktop helper.

V6 is being prepared for browser-store distribution so normal users will eventually be able to install the extension without **Developer mode → Load unpacked**.

## Found a bug?

Open a [bug report](https://github.com/viesca272/AnimeKai-RPC/issues/new/choose).

If AnimeKai RPC is running, use **Copy diagnostics** and include that information in the report. It makes connection and playback problems much easier to figure out.

## Have an idea for V6?

Feature suggestions are welcome.

Open a [feature request](https://github.com/viesca272/AnimeKai-RPC/issues/new/choose) and describe what you would like to see. Small quality-of-life improvements are especially useful because V6 is focused heavily on making the app easier to use.

## Privacy

AnimeKai RPC is designed around local playback detection and local Discord Rich Presence.

It does **not** need your:

- Discord password
- Discord user token
- bot token
- client secret

The Discord Application ID used for Rich Presence is a public identifier and is included in V6 so users do not have to configure one themselves.

See the project's [privacy page](privacy.html) for more information.

## Project website

The GitHub Pages site included in this repository contains installation help, V6 previews, troubleshooting, privacy information, and the changelog.

## License

See [LICENSE](LICENSE).

---

Thanks for checking out AnimeKai RPC.

**Made by viesca27**