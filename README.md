# AnimeKai RPC

**Watch on AnimeKai. Let Discord handle the rest.**

AnimeKai RPC automatically shows what you're watching on AnimeKai as Discord Rich Presence. Once the browser extension and Windows helper are installed, you can open an episode and just watch — the title, episode, playback state, timer, and artwork update in Discord for you.

**Made by viesca27**

---

## V6 is now the official release

AnimeKai RPC **V6.1.5** is the current stable version.

V6.1 keeps the stable V6 playback/RPC path and focuses on polish: faster detection, a browsing presence before playback starts, clearer health checks, and a cleaner Rich Presence artwork pipeline.

What you get in V6:

- immediate **Browsing AnimeKai** presence with crop-safe AnimeKai artwork sized for Discord
- faster event-first AnimeKai/player detection
- automatic AnimeKai title and episode detection
- play, pause, buffering, and timestamp tracking
- anime cover art while watching with a small AnimeKai branding icon when Discord accepts it
- Discord Rich Presence with the public AnimeKai RPC application already configured
- a small Windows desktop helper for Discord communication
- **Refresh** / reconnect controls
- one-click **Repair App** and detailed **Run health check** results
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

### Quick install

If you already know how to load an unpacked Chromium extension, the short version is:

1. Download the latest **Windows ZIP** from Releases.
2. Extract it to a folder you will keep.
3. Run **Install AnimeKai RPC.cmd**.
4. Open your browser's Extensions page and choose **Load unpacked**.
5. Select the package's **extension** folder.
6. Open the AnimeKai RPC setup page and enable **Player detection**.
7. Open Discord desktop, then open AnimeKai.

If this is your first time installing AnimeKai RPC, use the detailed steps below.

You do **not** need to create a Discord application, copy an Application ID, install Python, or keep a command window running. The public AnimeKai RPC Discord Application ID and packaged desktop helper are included in the Windows release.

### Before you start

You will need:

- Windows 10 or Windows 11
- the **Discord desktop app** installed and signed in
- Opera, Google Chrome, Microsoft Edge, or another Chromium-based browser
- the latest **AnimeKai-RPC-V6.1.5-Windows.zip** from the GitHub Releases page

> **Which download should I use?**  
> Most people should download the **Windows ZIP**. It contains both the browser extension and the desktop helper. The smaller **Extension ZIP** is mainly for people who already have the current desktop helper installed and only need the browser files.

### 1. Download and extract AnimeKai RPC

1. Open the [latest GitHub Release](https://github.com/viesca272/AnimeKai-RPC/releases/latest).
2. Download **AnimeKai-RPC-V6.1.5-Windows.zip**.
3. Right-click the ZIP and choose **Extract All**, or extract it with your preferred archive program.
4. Move the extracted folder somewhere you plan to keep it, such as your Documents folder.

Do not load the extension directly from inside the ZIP. While AnimeKai RPC is installed as an unpacked extension, your browser needs the extracted `extension` folder to stay in the same place.

After extracting, the package should contain roughly:

```text
AnimeKai-RPC-V6.1.5/
├─ extension/
├─ native_host/
├─ windows/
├─ Install AnimeKai RPC.cmd
├─ Repair AnimeKai RPC.cmd
└─ Uninstall AnimeKai RPC.cmd
```

### 2. Install the desktop helper

1. Make sure Discord is installed. It is fine if Discord is closed for the moment.
2. Double-click **Install AnimeKai RPC.cmd**.
3. If Windows warns about running a downloaded file, verify that you downloaded it from this project's GitHub Releases page before continuing.
4. Wait for the success message from AnimeKai RPC.
5. Close the installer message.

The helper is copied to:

```text
%LOCALAPPDATA%\AnimeKaiRPC
```

It handles the local connection between the browser extension and Discord. It starts when the extension connects to it, so you do **not** need to manually launch a server every time you watch anime.

If you are upgrading from V5 or an older V6 build, running the new installer updates the helper while preserving normal RPC preferences.

### 3. Load the browser extension

Browser-store publishing is still being finalized, so the GitHub build currently uses your browser's **Load unpacked** feature.

**Opera**

1. Open `opera://extensions`.
2. Turn on **Developer mode**.
3. If an older unpacked AnimeKai RPC is installed, remove or disable it.
4. Click **Load unpacked**.
5. Select the extracted `extension` folder — the folder that directly contains `manifest.json`.

**Google Chrome**

1. Open `chrome://extensions`.
2. Turn on **Developer mode** in the top-right corner.
3. Remove or disable an older unpacked AnimeKai RPC build if one is present.
4. Click **Load unpacked**.
5. Select the extracted `extension` folder.

**Microsoft Edge**

1. Open `edge://extensions`.
2. Turn on **Developer mode**.
3. Remove or disable an older unpacked AnimeKai RPC build if one is present.
4. Click **Load unpacked**.
5. Select the extracted `extension` folder.

If you accidentally select the folder *above* `extension`, the browser may say it cannot find the manifest. Go back and select the folder containing `manifest.json` itself.

### 4. Finish the first-run setup

AnimeKai RPC should open its setup page after the extension is installed.

1. Confirm that the **Desktop helper** is detected.
2. Click **Enable player detection**.
3. Accept the browser permission prompt.
4. Click **Check again** if the setup page has not refreshed yet.

Player detection is optional browser access used for AnimeKai's changing third-party embedded video players. It is what allows AnimeKai RPC to read play, pause, buffering, progress, and timestamps from those frames.

You can reopen the setup guide later from the AnimeKai RPC popup.

### 5. Verify that Discord Rich Presence works

1. Open the **Discord desktop app** and make sure you are signed in.
2. Open [AnimeKai](https://animekai.be/) in the browser where the extension is installed.
3. Within a moment, Discord should show **Browsing AnimeKai** and **Finding something to watch**.
4. Open an anime and start an episode.
5. The presence should switch to the anime title, episode, playback state, timer, and cover artwork.

V6.1.5 rebuilds the browsing artwork from a clean AnimeKai icon seed and avoids the older source-processing path that produced the black/static corruption. The popup now uses a packaged local PNG, while Discord gets a fresh versioned V6.1.5 asset URL. Square, 4:3, 16:9, and 2:1 variants are still included.

### What a successful install looks like

Once everything is installed correctly:

- the extension popup should show the **Desktop helper** as connected
- **Run health check** should show the helper, Native Messaging manifest, browser registration, local configuration, and Discord application as OK
- if Discord desktop is open, **Discord connection** should also show OK
- opening AnimeKai should produce **Browsing AnimeKai** in Discord
- starting an episode should replace that with the anime title, episode, playback state, timer, and cover

If Discord is closed, a healthy installation can still report that the install itself is fine while the Discord runtime connection is unavailable.

### Updating from an older V6 version

You do not need to wipe your settings for a normal update.

1. Download and extract the new Windows ZIP.
2. Run the new **Install AnimeKai RPC.cmd** to update the desktop helper.
3. Open your browser's Extensions page.
4. Remove the old unpacked AnimeKai RPC entry, or point/reload it using the new `extension` folder.
5. Refresh any AnimeKai tabs that were already open.

Appearance settings and normal RPC preferences are preserved where possible.

### If AnimeKai RPC does not connect

Try these in order:

1. Make sure the **Discord desktop app** is running — Discord in a web browser is not enough.
2. Open the AnimeKai RPC popup and press **Refresh**.
3. Run **Run health check** and look for any item marked **Check**.
4. If something is broken, press **Repair App**.
5. Refresh the AnimeKai tab and try playback again.
6. If the problem continues, use **Copy diagnostics** and include that output when opening a GitHub issue.

The desktop helper log is stored at:

```text
%LOCALAPPDATA%\AnimeKaiRPC\native_host.log
```

That file is especially useful when the popup says the desktop helper or Discord RPC is not connected.

### Uninstalling

To remove AnimeKai RPC:

1. Remove the AnimeKai RPC extension from your browser.
2. Run **Uninstall AnimeKai RPC.cmd** from the extracted Windows package.

This removes the Native Messaging registration and installed helper files. Browser-specific extension data can also be removed by your browser when the extension is deleted.

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

V6.1.5 includes an updated stable helper with:

- browsing Rich Presence with crop-safe AnimeKai artwork and an elapsed timer
- protocol v3 health/browsing support
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
