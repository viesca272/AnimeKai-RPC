# Install Anime-RPC V7 alpha 1

**Prerelease — still needs live checking.** V6.1.6 remains the stable download.

1. Download `Anime-RPC-Windows-v7.0.0-alpha.1.zip` from the [V7 release](https://github.com/viesca272/AnimeKai-RPC/releases/tag/v7.0.0-alpha.1). The separate extension ZIP and GitHub source archives do not include the Windows helper.
2. Extract the whole ZIP into a permanent folder. Close the browser before updating an existing helper so its executable is not in use.
3. Run **Install Anime-RPC.cmd**. The Windows helper is unsigned; only proceed with a download you trust. Python and a Discord developer account are not needed.
4. Open Chrome, Edge, or Opera's Extensions page, enable Developer mode, and use **Load unpacked** to select this package's `extension` folder. Update/reload your existing unpacked entry when possible; removing it can delete its browser settings. Disable other copies of Anime-RPC/AnimeKai RPC.
5. Open Discord desktop. Use the extension's setup guide to grant optional **Player detection** access, then reload the anime page.
6. AnimeKai is enabled initially. In **Sites**, opt into AnimePahe or 9anime to test those experimental adapters.
7. Press **Refresh**, then **Run health check**. A working helper installation and a live Discord connection are reported separately.

Only `animekai.be`, `animepahe.com`, `9animehd.live`, and their `www` variants are recognized. A similar name on another domain is not supported. Current live selectors, cross-origin players, and Discord artwork on all three sites still need manual verification.

## Upgrade and rollback

V7 preserves the unpacked extension's key, native-host name, installation folder (`%LOCALAPPDATA%\AnimeKaiRPC`), and normal RPC preferences. Those internal names remain for compatibility. Browser appearance settings survive if the same extension entry/storage is retained. Install the helper and extension from the same version.

For rollback, close the browser, run the V6.1.6 installer, and reload the V6 extension folder. Do not run V6 and V7 simultaneously. V7's helper is protocol 4; the popup warns when versions differ.

**Repair Anime-RPC.cmd** refreshes the helper and browser registrations while keeping preferences. **Uninstall Anime-RPC.cmd** removes the helper and registrations but retains local preferences; remove the extension separately. Repair and uninstall affect the shared V6/V7 helper installation.

## Before reporting a problem

Use **Refresh**, **Run health check**, and **Copy diagnostics**. Include your browser/version and the affected site. Preview diagnostics before posting publicly. The native helper log is `%LOCALAPPDATA%\AnimeKaiRPC\native_host.log`.

The included Help & FAQ answers common questions locally. It does not contact an AI service or save question history.
