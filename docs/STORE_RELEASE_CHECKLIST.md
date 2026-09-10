# Browser-store release checklist

This is the practical checklist to run before submitting V6.

- [x] Manifest V3 only
- [x] No remote executable code
- [x] Built-in Discord Application ID is a public identifier, not a secret
- [x] Required host access is limited to AnimeKai and the artwork provider
- [x] `<all_urls>` is no longer required at install time
- [x] Cross-origin player-frame access is requested only as an optional permission after a plain-English explanation
- [ ] Verify the optional player permission prompt and dynamic content-script registration in Chrome, Edge and Opera
- [ ] Confirm every remaining permission has a matching store disclosure and user-facing reason
- [ ] Privacy page matches the production code exactly
- [ ] Privacy page explains Jikan artwork lookups and optional embedded-player access
- [ ] Name the metadata / artwork provider used by production
- [ ] Confirm no Discord token, client secret, password or other credential is bundled
- [ ] Production extension IDs are registered in the Windows native-host manifest
- [ ] Store listing contains accurate screenshots and feature descriptions
- [ ] Support and privacy links are live
- [x] Desktop helper button points to a versioned HTTPS GitHub Release
- [ ] Installer and uninstaller are tested on a clean Windows account
- [ ] Repair App is tested with deliberately broken registry / manifest entries
- [ ] Signed desktop-helper installer is ready for public release
- [ ] Chrome Web Store test listing submitted
- [ ] Microsoft Edge Add-ons test listing submitted

## Alpha 4 note

Chrome's extension platform supports declaring optional host access and requesting it later with the permissions API. Alpha 4 uses that model for AnimeKai's changing third-party video frames instead of making broad access a required install permission.

The player content script still checks whether the frame belongs to an AnimeKai page and exits immediately when it does not.
