# AnimeKai RPC V6.1.6

V6.1.6 restores the playback-state badges on the watching Rich Presence.

## Play / pause badges are back

While an episode is open:

- **Playing** → the small Rich Presence image becomes a play icon
- **Paused** → the small Rich Presence image becomes a pause icon
- **Buffering / Finished** → AnimeKai artwork is used as a neutral fallback

The anime cover remains the large image, so the playback badge sits in the small overlay position where the AnimeKai logo was shown in V6.1.5.

The small-image hover text also follows the playback state: **Playing**, **Paused**, **Buffering**, or **Finished**.

## Browsing presence

The browsing state still uses the clean AnimeKai artwork pipeline from V6.1.5.

## New playback icon assets

V6.1.6 ships two simple PNG assets generated during the release build:

- `AnimeKai-Playback-Play-256x256.png`
- `AnimeKai-Playback-Pause-256x256.png`

They use a clean black circular button with a white playback symbol so they remain readable at Discord's small overlay size.

## Upgrade

1. Download **AnimeKai-RPC-V6.1.6-Windows.zip**.
2. Extract it.
3. Run **Install AnimeKai RPC.cmd**.
4. Reload the unpacked extension from the V6.1.6 `extension` folder.
5. Refresh any open AnimeKai tabs.
6. Press **Refresh** once in AnimeKai RPC.

**Made by viesca27**
