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

## Current version

### V5 — Stable

V5 is the version to use if you just want AnimeKai RPC working right now.

It uses the stable playback detection and local Discord RPC setup that the project was built around.

### V6 — In development

V6 is currently being built in [`src/v6`](src/v6).

The main goal of V6 is to make AnimeKai RPC feel more like a normal app that anyone can install and use without needing to understand how the technical parts work.

Some of the V6 work includes:

- browser-store-ready extension packaging
- one-click **Repair App**
- a cleaner first-run setup
- theme and accent-color customization
- better cover-art recovery and local caching
- no generic backup image when a cover fails
- clearer diagnostics and error messages
- better desktop-helper updates
- accessibility options such as reduced motion

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

The helper is necessary because Chromium extensions cannot directly access Discord's local IPC connection.

The Rich Presence itself does **not** require a cloud server.

## V6 Repair App

One of the features I really wanted for V6 was a simple way to fix the app if something gets messed up.

Instead of making users dig through folders or registry entries, **Repair App** is being designed to check things like:

- desktop helper installation
- Native Messaging manifest
- Opera / Chrome / Edge registration
- extension-to-helper connection
- Discord RPC connection
- local configuration

If something can be safely fixed automatically, the app will fix it and explain what happened.

Your personal themes and settings should stay untouched during a normal repair. A full reset will be a separate option.

## Better cover artwork

V6 first tries to use the cover provided by AnimeKai.

If that image is missing or broken, the extension can look for another matching anime poster from an anime metadata provider and cache the result locally.

The goal is to keep a real anime cover in Discord instead of falling back to a generic placeholder whenever artwork fails.

## Customization

V6 is also getting an Appearance section so users can make the extension feel more personal.

Planned options include:

- accent color picker / color wheel
- dark, light, and system themes
- compact and detailed layouts
- reduced-motion mode
- theme presets
- optional gradients and background effects
- import / export theme settings

None of this should interfere with the actual playback or RPC logic.

## Installation

V5 currently uses a Chromium extension plus a small Windows Native Messaging helper.

V6 is being prepared for browser-store distribution so normal users will eventually be able to install the extension from a store instead of using **Developer mode → Load unpacked**.

The Windows helper will still be required, but the extension will detect when it is missing and guide the user through installing it.

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

The Discord Application ID used for Rich Presence is a public identifier and can safely be included in the app.

See the project's [privacy page](privacy.html) for more information.

## Project website

The GitHub Pages site included in this repository contains installation help, V6 previews, troubleshooting, privacy information, and the changelog.

## License

See [LICENSE](LICENSE).

---

Thanks for checking out AnimeKai RPC.

**Made by viesca27**