# Anime-RPC V7 roadmap

Status: V7 alpha 1 implemented — prerelease, still needs live checking.
Updated: September 29, 2026.

[Release notes](V7_RELEASE_NOTES.md) · [Install guide](V7_INSTALL.md) · [Test record](V7_TESTING.md) · [Store readiness](V7_STORE_READINESS.md)

Code and fixture checks are in `src/v7` and `tests/v7`. The new site adapters are provisional; AnimePahe and 9anime are off by default. The demo uses simulated playback. Live site playback and Discord validation remain release gates.

V7 expands AnimeKai RPC into **Anime-RPC**: Discord Rich Presence for multiple anime sites, with easier installation and a clearer public presence. V6.1.6 remains the current stable release, including its black playback-badge soft update.

## Agreed direction

- Use **Anime-RPC** as the project name.
- Retain AnimeKai support and target **AnimePahe** and **9animehd.live**.
- Prepare for browser-store distribution and simplify desktop-helper setup.
- Improve the project page, demonstration material, and discoverability.
- Finish this roadmap before starting implementation.

These remain stable-release goals. Alpha implementation does not establish verified live support.

## Site targets

| Site | Target | Current evidence | Work needed |
| --- | --- | --- | --- |
| AnimeKai | Existing animekai.be integration | Supported by V6; current availability and playback need a fresh check | Preserve behavior and verify live playback before promising V7 support |
| AnimePahe | animepahe.com (provisional exact domain) | Experimental adapter and fixtures; direct access blocked | Verify current live DOM, embedded players, and playback |
| 9anime | https://9animehd.live | User-selected domain; experimental adapter and fixtures | Verify actual episode DOM, frames, and live playback |

9animehd.live replaces Miruro in the V7 scope. Support applies to verified domains, not every site using the same name. Homepage access alone does not establish playback compatibility.

## Milestone 1 — Confirm scope and branding

- [x] Choose the Anime-RPC name and the three site targets.
- [x] Update the main README with the new project name and clearly marked V7 plans.
- [ ] Rename the GitHub repository to Anime-RPC.
- [ ] Audit repository links, GitHub Pages paths, release-asset URLs, support links, and workflow references before completing the rename.
- [ ] Plan the extension, website, installer, and Discord application display-name changes.
- [x] Define the V6-to-V7 migration: settings, extension IDs, native-host registration, and existing installations.
- [ ] Confirm each site's live domain and basic playback feasibility.

Completion: site targets and naming changes are documented, with a migration plan that preserves working V6 installations.

## Milestone 2 — Multi-site detection

- [x] Give each site its own detection module and use a shared playback format for Discord.
- [x] Collect the site name, anime title, episode, available episode total, artwork, playback position, duration, and playback state.
- [x] Show unknown metadata honestly rather than inventing episode totals or timestamps.
- [ ] Handle embedded players, episode navigation, player replacement, and tab closure.
- [x] Add a Supported sites section with per-site enable/disable controls and understandable permission requests.
- [x] Prefer an actively playing tab; define a stable tie-breaker when more than one tab is playing.
- [x] Keep a paused foreground tab from replacing another tab that is playing.
- [ ] Prevent unrelated pages, advertisements, or stale player frames from publishing anime activity.

Completion: each supported site passes the playback checks below and multiple tabs do not repeatedly overwrite one another's presence.

## Milestone 3 — Consistent Discord presence

- [ ] Preserve title, episode, cover artwork, playback timers, and pause/resume behavior across supported sites.
- [x] Retain **black circular play/pause badges with white symbols**.
- [x] Make browsing text and fallback artwork appropriate to the detected site.
- [x] Preserve alternate artwork recovery and existing appearance preferences.
- [x] Make Refresh, reconnect, health checks, and diagnostics identify the active site and explain detection failures.
- [x] Clear stale presence when playback or a supported session ends, using a documented policy.

Completion: users get the same core presence features on every supported site, with clear fallbacks where metadata is unavailable.

## Milestone 4 — Installation and browser stores

Proposed order: Chrome Web Store first, Microsoft Edge Add-ons next. Continue checking Opera compatibility. The desktop helper remains required for the current Discord connection architecture.

- [ ] Audit permissions against actual multi-site behavior, including tabs and optional embedded-player access.
- [ ] Request only the access needed for enabled features and test denied/revoked permissions.
- [x] Package detection logic with the extension; audit for remotely executed code.
- [ ] Update the privacy page and store disclosures for site metadata, Discord presence, native messaging, artwork lookups, and local storage.
- [ ] Record production store extension IDs and register them in the helper allowlist.
- [ ] Test a clean Windows install, repair, uninstall, and migration from V6.1.6.
- [ ] Choose the desktop-helper installer signing and distribution approach.
- [x] Make helper installation and missing-helper recovery clear during onboarding.
- [ ] Prepare listing text, screenshots, support/privacy links, and reproducible reviewer setup instructions.
- [ ] Submit store builds, resolve review feedback, and verify the installed store versions.

Completion: the installation path is tested and store submissions are ready. Store approval and public listing availability must be tracked separately from code readiness.

Use the [existing store checklist](STORE_RELEASE_CHECKLIST.md) as a starting point; its completed V6 items must be rechecked for V7.

## Milestone 5 — Reach and launch material

- [ ] Update the landing page and GitHub description for Anime-RPC.
- [x] Publish an accurate supported-sites list with platform requirements.
- [x] Record a clearly labeled browser UI demo with simulated playback, artwork, controls, and FAQ.
- [ ] Record end-to-end live site detection and actual Discord presence after manual verification.
- [ ] Prepare a concise installation guide and troubleshooting screenshots.
- [ ] Improve repository topics, release descriptions, and bug-report prompts for multi-site reports.
- [ ] Draft announcements for relevant communities that permit project sharing.
- [ ] Add store install buttons only when the corresponding listings are live.

Completion: someone unfamiliar with the project can understand its purpose, install it, and find help. Announcement drafts are prepared before any outreach is sent.

## Website FAQ — first help resource

- [x] Create a public FAQ page for setup, supported sites, common connection problems, privacy, and V7 plans.
- [x] Link the FAQ from the website navigation, support page, README, and this roadmap.

Read the [Anime-RPC website FAQ](https://viesca272.github.io/AnimeKai-RPC/faq.html). It uses expandable written answers and works without JavaScript. V6.1.6 answers are separated from the experimental V7 alpha. The extension also includes the local guided-help page described below.

## V7 alpha feature — Local guided help

A dedicated Help & FAQ page now answers simple Anime-RPC questions using bundled written answers. It is opened from the popup or setup page.

Examples:
- "How do I install the desktop helper?"
- "Why isn't my anime showing on Discord?"
- "Why does the player say waiting?"
- "Which sites and browsers are supported?"
- "How do I update or repair the extension?"

The first version uses suggested questions and simple text matching. Answers ship with the extension and require no AI account, API key, or paid service. It is guided help, not a general-purpose AI chatbot.

- [x] Decide whether the help panel lives in the popup or a dedicated help page.
- [x] Write short, version-specific answers based on the setup guide, supported-sites list, and troubleshooting documentation.
- [x] Add suggested questions and recognize common wording for the same issue.
- [x] Link to existing Refresh, Run health check, Repair App, and support instructions; leave actions under the user's control.
- [ ] Optionally explain locally available health-check results when the user requests help, without automatically uploading diagnostics or chat text.
- [x] For unknown questions, say that no matching answer was found and offer documentation or the GitHub issue page.
- [ ] Check keyboard access, answer accuracy, offline behavior, and unsupported-question handling.

Completion: the help panel answers the documented common questions accurately, distinguishes planned features from released support, and directs unresolved problems to useful next steps.

A cloud AI service is a separate future decision requiring a provider, cost plan, and data-handling design. It is not a dependency of this local version.

## Validation before V7 stable

Record the browser, site/domain, build, result, and any limitation for each check.

| Area | Required checks |
| --- | --- |
| Playback on every supported site | Start, pause, resume, seek, buffering, finish, next episode, full page refresh, and navigation without reload |
| Metadata and artwork | Correct title/episode, missing total/duration, sub/dub where offered, missing cover, and artwork fallback |
| Multiple tabs | Two sites open, two players active, playing versus paused tabs, closing the selected tab, and no repeated presence switching |
| Permissions | Grant, deny, revoke, disabled site, embedded-frame access, and unrelated-page isolation |
| Discord and helper | Discord closed/reopened, helper disconnect/reconnect, Refresh, health checks, and repair |
| Help chatbot, if included | Common question wording, correct version/site answers, unknown questions, offline use, keyboard access, and no automatic uploads |
| Distribution | Clean installation, V6 migration, uninstall, store extension IDs, working downloads, and public documentation links |

A site becomes advertised as supported only after its playback checks pass. If access or playback cannot be verified, mark it pending and revisit the launch scope.

## Release sequence

1. Complete the roadmap and outstanding domain/migration decisions.
2. Implement V7 in an isolated development branch.
3. Test prerelease builds while V6.1.6 remains the stable download.
4. Complete the compatibility matrix, store preparation, and release notes.
5. Publish V7 when its release checks are satisfied; announce store availability only after approval.

## Deferred from the initial V7 scope

Firefox, macOS/Linux helpers, further streaming sites, watch-history syncing, and automatic helper updates are separate follow-up decisions. Existing V6 backlog items such as theme import/export are not automatically V7 launch requirements.

## Research and reference links

- [V6 roadmap](V6_ROADMAP.md)
- [Browser-store release checklist](STORE_RELEASE_CHECKLIST.md)
- [Chrome native messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)
- [Chrome Web Store permissions policy](https://developer.chrome.com/docs/webstore/program-policies/permissions)
- [Chrome Web Store privacy disclosures](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)

**Made by viesca27**

## Alpha implementation checkpoint

Implemented: separate adapters, exact domain registry, per-site switches, normalized playback, playing-first tab selection, frame-tree validation, navigation cleanup, site artwork, black badges, replacement-cover persistence, local FAQ help, migration-aware Windows packaging, and automated checks. Checked boxes describe implemented work; multi-site live acceptance is still open.

Remaining: live Chrome/Edge/Opera and Discord testing, current-site selector verification, repository rename, Discord application display name, store IDs/allowlists/listings, signed installer distribution, image-rights review, and wider outreach. See the test record for the unchecked manual gate.
