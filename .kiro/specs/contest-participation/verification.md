# Contest participation redesign — 2026-09-06

Scope: `/hall-of-fame/participate`. Other photo upload consumers keep their existing behavior.

Design reference: official Figma MCP `get_design_context`, file `7VXGIjqr1eZBEmsp3OPNie`, Hall of Fame node `3349:1763500`. Reuses point-100, primary brown, PawIcon, NavigationBar, Container, TextareaField, Button and CtaModal. This is a new composition based on the existing design system; no Figma file was modified.

The dedicated composer pairs a full photo preview with the introduction and CTA. Mobile is one column, tablet/desktop two columns. Both required fields are labeled, touch actions are 44px+, the textarea follows the shared TextareaField defaults without page-level style overrides (updated 2026-09-07), and the submit action stays in document flow so it cannot cover the keyboard or safe area. Photo replacement, drop, processing, failure, and exit-confirmation states are included.

`PhotoUploadField` is a reusable single-photo picker. `preparePhoto` accepts JPG/PNG/WEBP/GIF/AVIF/HEIC/HEIF, including empty/generic MIME with recognized extensions, checks 0–100MB, verifies actual decoding, preserves aspect and EXIF orientation, and normalizes to JPEG with a 2560px longest edge and 5MB output cap. Transparent images use white; animations use a still frame. HEIC fallback loads heic-to/csp only on demand. RAW/SVG/video are excluded. Device-specific HEIF codecs can still fail and receive actionable feedback.

## Verified

- TypeScript check and production build passed.
- Changed-file ESLint passed; 11 input-policy regression tests passed.
- Orca embedded browser: same-origin iframe viewports 375, 767, 768, 1024, 1439, 1440, 1920; scrollWidth equals viewport at all widths and expected one/two-column positions measured. Native Orca viewport commands were overridden by the visible pane, so iframe viewport measurements were used rather than claiming device emulation.
- Actual libheif example.heic: JPEG preview 1280×854. Upload to the existing local API at localhost:8080 succeeded (HTTP 200); returned CDN image decoded at 1280×854. Test storage object deleted (HTTP 200). No contest entry was published.
- Actual 4032×3024 JPEG, PNG, WEBP, GIF and AVIF fixtures: all decoded to JPEG previews at 2560×1920.
- EXIF orientation=6 fixture: 400×200 source rendered correctly as 200×400 output.
- Corrupt JPEG: readable error shown and previous valid preview retained.
- Text entry enables submit only with a valid prepared photo. Photo input resets to allow same-file reselection.

## Remaining limitations

Physical iPhone Safari / Android Chrome gallery and camera pickers have not been tested. Browser viewport and real format tests do not establish every device/OS/codec combination. Live Photo movie data and RAW are not photo submissions. Full contest creation was not exercised to avoid entering the user's account in a live contest.

Repository-wide pre-existing checks fail outside the change: ESLint `@next/next/no-assign-module-variable` in tests/application-chat-button.test.cjs and tests/onboarding-completion.test.cjs; Steiger public API sidestep in src/app/signup/_ui/SignupEntryGuard.tsx. Unrelated existing edits were preserved. Not deployed.
