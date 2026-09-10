# Browser-store release checklist

This is the practical checklist to run before submitting V6.

- Manifest V3 only
- No remote executable code
- Every permission has a user-facing reason
- Review the current `<all_urls>` / iframe requirement and reduce it if possible
- Privacy page matches the code exactly
- Name the metadata / artwork provider used by production
- No Discord token, client secret, password or other credential is bundled
- The publisher Discord Application ID is safe to ship because it is public
- Production extension IDs are registered in the Windows native-host manifest
- Store listing contains accurate screenshots and feature descriptions
- Support and privacy links are live
- Desktop helper download is HTTPS and points to a versioned GitHub Release
- Installer and uninstaller are tested on a clean Windows account
- Repair App is tested with deliberately broken registry / manifest entries
