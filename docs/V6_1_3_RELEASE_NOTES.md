# AnimeKai RPC V6.1.3

V6.1.3 is a small Rich Presence artwork and setup-documentation polish release.

## Crop-safe AnimeKai browsing artwork

Discord can display Rich Presence artwork in a much wider thumbnail than the source image. The square AnimeKai image used in V6.1.2 could therefore look zoomed or show only part of the K.

V6.1.3 adds a crop-safe artwork pack generated from the AnimeKai artwork:

- **2:1 — 1024×512** — the default browsing image, designed around Discord's wide thumbnail
- **16:9 — 1280×720** — wide fallback
- **4:3 — 1024×768** — classic fallback
- **Square — 512×512** — compact/small-image fallback

The AnimeKai mark is centered with extra green breathing room, so Discord has room to crop the thumbnail without chopping off the logo.

The desktop helper tries the 2:1 browsing artwork first and keeps the other layouts available as fallbacks if an image cannot be used. While watching, the anime cover remains the large image and the square AnimeKai artwork is used for the small **Watching on AnimeKai** branding image.

There is no new setting to configure; the artwork selection stays automatic.

## Better installation documentation

The main README now has a much more detailed installation guide for new users, including what to download, Windows/Discord/browser requirements, extracting the package correctly, installing/updating the helper, Opera/Chrome/Edge Load unpacked steps, Player detection, verification, updating, troubleshooting, diagnostics, logs, and uninstalling.

## Everything else stays familiar

V6.1.3 keeps the V6.1 browsing states, event-first detection, detailed health checks, gradient appearance presets, Repair App, automatic cover recovery, and protocol v3 helper behavior.

## Upgrade from V6.1.2

1. Download **AnimeKai-RPC-V6.1.3-Windows.zip**.
2. Extract it somewhere permanent.
3. Run **Install AnimeKai RPC.cmd** to update the helper.
4. Replace/reload the unpacked extension using the new V6.1.3 `extension` folder.
5. Refresh any AnimeKai tabs that were already open.

**Made by viesca27**
