# AnimeKai RPC V6.1.4

V6.1.4 is a Discord artwork hotfix and installation-documentation polish release.

## Fixed: corrupted browsing artwork in Discord

The V6.1.3 browsing image could render with a black block and colored/noisy line inside Discord. The affected release used progressively encoded JPEG artwork, which is not a reliable choice for Discord's external Rich Presence image pipeline.

V6.1.4 removes that path entirely:

- browsing artwork is now published as **PNG**
- no progressive JPEG encoding is used
- the **padded square 512×512 PNG** is now the default browsing image because it matches Discord's current activity thumbnail reliably
- the AnimeKai mark remains centered with breathing room so it survives Discord cropping
- the watching presence still keeps the anime cover as the large image and the square AnimeKai image as the small **Watching on AnimeKai** branding image

## Multiple aspect ratios and resolutions

V6.1.4 publishes eight crop-safe PNG variants:

- Square — **512×512** and **1024×1024**
- 4:3 — **512×384** and **1024×768**
- 16:9 — **640×360** and **1280×720**
- 2:1 — **640×320** and **1280×640**

The square 512×512 image is the default. The others are kept as alternate/fallback assets so the project is not tied to one Discord layout.

## Better installation guide

The main README now includes:

- a quick-install checklist for experienced users
- a detailed first-time installation walkthrough
- Windows/Discord/browser requirements
- clear guidance on which ZIP to download
- extraction and permanent-folder guidance
- desktop-helper installation details
- Opera, Chrome, and Edge **Load unpacked** instructions
- first-run Player detection setup
- a clear **What a successful install looks like** section
- updating, troubleshooting, diagnostics, logs, and uninstall steps

## Upgrade from V6.1.3

1. Download **AnimeKai-RPC-V6.1.4-Windows.zip**.
2. Extract it somewhere permanent.
3. Run **Install AnimeKai RPC.cmd**.
4. Replace/reload the unpacked extension using the V6.1.4 `extension` folder.
5. Refresh any already-open AnimeKai tabs.
6. If Discord still has the old image cached, press **Refresh** in AnimeKai RPC or restart Discord once.

All V6.1 browsing, faster detection, health checks, Repair App, gradient presets, and cover-recovery behavior remain in place.

**Made by viesca27**
