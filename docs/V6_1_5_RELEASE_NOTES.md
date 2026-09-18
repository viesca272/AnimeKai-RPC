# AnimeKai RPC V6.1.5

V6.1.5 fixes the browsing artwork corruption that was still visible in V6.1.4.

## What actually caused it

The same black block / colored-noise strip was visible inside the AnimeKai RPC popup, not only in Discord. That confirmed the problem was in the artwork asset being fed into Rich Presence rather than Discord simply cropping the image.

V6.1.5 stops reprocessing the old source artwork entirely.

## Clean artwork pipeline

The browsing artwork is now rebuilt from a clean AnimeKai icon seed and uses that source directly.

Changes:

- no color-key extraction
- no alpha reconstruction
- no progressive JPEG
- no reuse of the older problematic source asset
- the popup uses the packaged local PNG instead of re-downloading the Rich Presence image URL
- Discord Rich Presence uses a fresh V6.1.5 release URL so older cached artwork is bypassed

The default remains the padded square 512×512 image.

## Included sizes

- Square — 512×512 and 1024×1024
- 4:3 — 512×384 and 1024×768
- 16:9 — 640×360 and 1280×720
- 2:1 — 640×320 and 1280×640

All are generated as standard PNG files and validated during the release build.

## Watching presence

Watching behavior remains unchanged:

- anime cover = large image
- AnimeKai branding = small image
- small image text = **Watching on AnimeKai**
- automatic cover-only fallback remains available if Discord rejects the small branding image

## Upgrade

1. Download **AnimeKai-RPC-V6.1.5-Windows.zip**.
2. Extract it.
3. Run **Install AnimeKai RPC.cmd**.
4. Reload the unpacked extension from the V6.1.5 `extension` folder.
5. Refresh any open AnimeKai tabs.
6. Press **Refresh** in the popup once.
7. Restart Discord only if it still displays an older cached image.

**Made by viesca27**
