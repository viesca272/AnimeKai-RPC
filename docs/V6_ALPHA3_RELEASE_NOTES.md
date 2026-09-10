# AnimeKai RPC V6 Alpha 3

Alpha 3 focuses on making AnimeKai RPC feel like something a normal user can install without knowing what a Discord Application ID is.

## What's new

- **Discord Application ID is now built in.** Fresh users no longer need to create a Discord app or paste an ID into the extension.
- Restored the **V5 purple A extension icon** for the browser toolbar and Extensions page.
- Kept the Alpha 2 **Refresh** button and Discord reconnect flow.
- The Windows installer now seeds the bundled AnimeKai RPC Discord application automatically while preserving the user's playback/template preferences.
- The native helper also contains the bundled Application ID as a fallback, so a missing or blank local config no longer blocks Discord RPC.
- The popup now says **AnimeKai RPC Discord app included** instead of showing an Application ID field.
- Diagnostics report the Discord application as bundled instead of asking users to manage it.

## Installing Alpha 3

1. Download `AnimeKai-RPC-V6.0.0-alpha.3-Windows.zip`.
2. Extract it somewhere permanent.
3. Run `Install AnimeKai RPC.cmd`.
4. Remove or disable the Alpha 2 extension in your browser.
5. Open the browser Extensions page and use **Load unpacked** on Alpha 3's `extension` folder.
6. Open AnimeKai and play an episode.
7. If Discord does not appear immediately, open the popup and press **↻ Refresh** once.

You should not need to enter a Discord Application ID anywhere in Alpha 3.

## Testing notes

Please test a fresh install if possible, not only an upgrade from V5/Alpha 2. The main thing we want to confirm in this build is that a new user can install the helper, load the extension, open AnimeKai, and get Discord Rich Presence without doing any Discord developer setup.

V5 remains the stable release while V6 is being tested.

**Made by viesca27**
