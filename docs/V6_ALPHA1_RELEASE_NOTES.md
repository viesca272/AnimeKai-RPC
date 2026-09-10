# AnimeKai RPC V6 Alpha 1

V6 Alpha 1 is the first public test build of the V6 branch.

This is **not the stable release yet**. V5 remains the safer choice if you just want the proven build. Alpha 1 is for testing the new V6 experience and helping find rough edges before the browser-store release.

## What's new

- New V6 popup and appearance controls
- Accent color picker
- Dark / Light / System theme foundation
- Compact-layout and reduced-motion settings
- One-click **Repair App** and health-check commands
- Native helper self-repair for Native Messaging registration
- Alternate anime cover lookup and local caching
- Text-only Discord fallback while V6 looks for another real poster instead of showing a generic backup image
- Friendlier diagnostics and Copy Diagnostics
- V5's working AnimeKai player detection carried forward

## Installing Alpha 1

1. Download `AnimeKai-RPC-V6.0.0-alpha.1.zip` from this release.
2. Extract it somewhere permanent.
3. Double-click `Install AnimeKai RPC.cmd`.
4. Open your browser's Extensions page.
5. Enable Developer mode and choose **Load unpacked**.
6. Select the included `extension` folder.
7. Disable older AnimeKai RPC extension builds while testing V6.
8. Open AnimeKai and play an episode.

If you already used V5, the helper installer keeps your existing local configuration so your Discord Application ID can carry over.

## Important Alpha note

A fresh install does not yet ship with the shared public Discord Application ID baked in. That will be wired into the public/store build before V6 stable. Existing V5 users can reuse the Application ID already saved locally.

The extension also still uses broad iframe access inherited from the working player detector. Tightening that permission is part of the store-readiness work before V6 stable.

## Problems or ideas

Use the repository's Bug Report or Feature Request forms. If the extension opens, use **Copy diagnostics** and include the result with bug reports.

**Made by viesca27**
