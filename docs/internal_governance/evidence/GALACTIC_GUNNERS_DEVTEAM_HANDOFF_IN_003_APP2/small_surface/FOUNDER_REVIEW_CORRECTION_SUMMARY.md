# APP2 Founder Review Correction Summary

Correction scope:

- Added root `favicon.ico` derived from `assets/images/owned/branding/gg_logo_compact_v002.png`.
- Added explicit ICO favicon reference and retained existing PNG/apple favicon references.
- Added favicon link versioning so browser tab caches refresh to `gg-ship-crest-v003`.
- Updated Docker image assembly so `/favicon.ico` is served from the container root.
- Updated Docker HTTP verifier to check `/favicon.ico` and the owned ICO derivative.
- Changed MainMenu `CAN YOU SAVE THE DAY?` CTA to `GG_FONT_TITLE`.
- Added Preloader font readiness before MainMenu starts for `GalacticGunnersTitle` and `GalacticGunnersDisplay`.
- Reworked MainMenu placement to keep logo, CTA, primary play crest, touch selector, best-played text, sound and info icons inside the visible canvas.
- Preserved the existing rear watermark/titlecard background without changing its asset.

Governance status:

- No new artwork introduced.
- No gameplay, scoring or damage logic changes made.
- Existing rear watermark/titlecard retained.
- Founder visual, functional and audio-in-context acceptance remain pending.

Verification:

- Docker HTTP verification PASS; transcript: `FOUNDER_REVIEW_DOCKER_HTTP_VERIFY.txt`.
- Browser/CDP verification PASS at 1366x665 constrained desktop viewport; result includes explicit bounds for key menu elements and `gg-ship-crest-v003` favicon links: `FOUNDER_REVIEW_MENU_FONT_FAVICON_CHECK.json`.
- Rendered menu evidence captured: `FOUNDER_REVIEW_MENU_FONT_FAVICON_CHECK.png`.
