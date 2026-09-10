# AnimeKai RPC

**Watch on AnimeKai. Let Discord handle the rest.**

AnimeKai RPC is a small Windows + browser project that automatically shows what you're watching on AnimeKai as Discord Rich Presence.

**Made by viesca27**

## What it shows

When you're watching an episode, AnimeKai RPC can show things like:

- the anime title
- current episode and total episodes
- play / pause / buffering state
- watch time and timestamps
- cover artwork
- a button back to AnimeKai

You don't have to update anything manually — open an episode, press play, and the presence follows along.

## Current status

**V5 is the stable version.**  
**V6 is now in active development** in [`src/v6`](src/v6).

V6 is focused less on adding random features and more on making the whole app easier for normal people to install, customize, repair, and eventually download from a browser store.

### What's coming in V6

- browser-store-ready extension packaging
- one-click **Repair App**
- a cleaner first-run setup
- accent color / theme customization
- better cover-art recovery and caching
- no generic backup image when artwork fails
- friendlier diagnostics and error messages
- better update handling for the desktop helper

You can follow the work in the [V6 roadmap](docs/V6_ROADMAP.md).

## How it works

AnimeKai RPC has two small parts:

```text
AnimeKai in your browser
        ↓
AnimeKai RPC extension
        ↓
Local Windows helper
        ↓
Discord Rich Presence
```

The helper is needed because normal Chrome/Opera/Edge extensions cannot talk directly to Discord's local IPC connection.

There is no cloud server required for the Rich Presence itself.

## V6 development build

The first V6 alpha source is in [`src/v6`](src/v6). It keeps the playback detection that already works in V5 and starts adding the new V6 features around it.

This is **development code**, so V5 should still be treated as the stable build for now.

## Repair App

One of the main V6 features is a proper Repair App button. The goal is for it to check and fix the common stuff automatically:

- desktop helper installation
- Native Messaging manifest
- Chrome / Opera / Edge registration
- Discord connection
- local configuration

Repair is designed to keep your personal themes and settings. Resetting everything is a separate option.

## Cover artwork

V6 first uses the artwork AnimeKai provides. If that image fails, it can look up another poster from an anime metadata provider and cache the result locally.

The idea is simple: if one cover breaks, find another real cover instead of throwing a generic AnimeKai placeholder into Discord.

## Website

The project website is hosted with GitHub Pages and lives in this repository. It includes installation help, V6 previews, troubleshooting, privacy information, and the changelog.

## Found a bug or have an idea?

Open an [issue](https://github.com/viesca272/AnimeKai-RPC/issues). If the app is running, use **Copy diagnostics** first and paste that into the report — it makes problems much easier to track down.

Suggestions are welcome too. V6 is being built around making the app easier to use, so small quality-of-life ideas are useful.

## A quick privacy note

AnimeKai RPC is designed around local playback detection and local Discord RPC. It does **not** need your Discord password, user token, or bot token.

The Discord Application ID used for Rich Presence is a public identifier and is safe to include in a release.

## License

See [LICENSE](LICENSE).

---

Made by **viesca27**.
