# AnimeKai RPC V6 Alpha 2

Alpha 2 is a focused bug-fix build for Discord detection and connection recovery.

## Fixed

- Restored a **Refresh** button to the popup, similar to V5.
- Refresh now reconnects the Discord RPC session without reloading the AnimeKai page.
- Refresh forces AnimeKai to send a fresh page/player state back to the extension.
- Restored the **Discord Application ID** field so users can confirm or repair a missing ID.
- Saving an Application ID now immediately reconnects Discord and refreshes the current activity.
- Health checks now report whether an Application ID is configured and whether Discord actually connected.
- Repair App now also reconnects Discord RPC after repairing Native Messaging registration.
- Diagnostics now clearly show Application ID, helper, Discord RPC, AnimeKai, player, playback, and RPC mode states.

## Installing Alpha 2

1. Download `AnimeKai-RPC-V6.0.0-alpha.2-Windows.zip`.
2. Extract it somewhere permanent.
3. Run `Install AnimeKai RPC.cmd`.
4. Disable/remove the Alpha 1 extension in your browser.
5. Open the browser Extensions page and use **Load unpacked** on the new `extension` folder.
6. Open AnimeKai and start an episode.
7. Open the AnimeKai RPC popup and click **↻ Refresh**.

If Discord still says **Not connected**, check the Application ID field in the popup. V6 will reuse your saved V5 ID when it is available, but Alpha 2 also lets you enter/save it manually again.

## What to send with a bug report

Click **Copy diagnostics** in the popup and paste that into a GitHub Bug Report. It now includes whether the Application ID is configured and the exact Discord connection state.

V5 remains the recommended stable release while V6 is being tested.

**Made by viesca27**
