# Plex R3 beta validation

Validated locally on 2026-11-05. Source baseline: `46e7a0cd4df1c31ebab036e4050d6657083ffc12`. This record describes a beta candidate, not a deployment or published release.

## Passed

- Standard-library source checks: English/Arabic direction and language, unique IDs, local links and CSS asset paths, approved R3 logo SHA-256 values, pinned original font hashes, web font source mapping, complete notices and deterministic kit/checksum consistency.
- Node syntax checks for theme and brand tools; `git diff --check`.
- Chromium 156.0.8078.74 local browser matrix: **24 cases**, covering English and Arabic × 320/390/1440 px × System/Light/Dark/Black. The existing production Content-Security-Policy was applied to the local responses; no policy was relaxed.
- All matrix cases: correct resolved appearance, real loaded language font, Regular 400 body copy, English 600/Arabic 700 headings, decoded images including lazy wallpapers, no horizontal viewport overflow and no page JavaScript errors.
- **144 transparent PNG exports** completed from the six artwork cards across the matrix; files had PNG signatures and 1600 px widths. Permitted background selectors and colour copy/status fallback were exercised. Keyboard focus reached the skip link.
- Manual visual inspection of English and Arabic at desktop and narrow mobile sizes, including the connected Arabic type specimen, wordmarks, tables, palette, pattern cards and wallpaper layout. The native Mac in-app browser was also inspected at its normal desktop size.
- Font-table audit of all eight web faces: expected true weight classes, shaping tables present and reserved Plex names absent from modified family-name records.
- Four R3 wordmark SVGs match approved originals byte-for-byte. The existing symbol files, palette token file, icons, patterns and wallpaper image files are unchanged. README/social preview artwork uses supplied original R3 PNGs without redrawing.

Run the README checks and optional `scripts/browser-review.cjs` against a local server to reproduce. Local screenshots and machine-readable results are under ignored `.local/browser-review/`; they are not part of the hosted site.

## Release scope and limitations

Candidate version: **v0.2.0-beta.1**. Intended attached artifact: `kit/cave-brand-kit.zip` and `kit/SHA256SUMS`, plus the tag's source archives. The kit contains 24 files and is about 5 MB because it preserves the exact editable SVG masters with embedded fonts and unmodified original TTFs. Compact renamed web fonts serve normal page copy. No new runtime dependency is needed.

Native Safari/Firefox, physical iOS/Android devices, screen-reader acceptance and a full accessibility audit have not been completed. The local static server does not establish Firebase clean-URL routing, live cache invalidation, public HTTPS, deployment exclusions or production font/asset behavior; verify those on the separately authorized rollout. Public site and GitHub-release publication remain pending exact-artifact review and owner notification.

CI remains disabled. No paid services, credentials, account/access settings, repository ownership or Firebase ownership were changed. Existing response security headers are preserved. The repository transfer remains the owner's separate action.
