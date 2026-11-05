# Brand sources

The approved source is **Cave Brand - Plex R3 - 2026-11-01**. The four English/Arabic colour/white logo SVGs are copied byte-for-byte from its `01 Logo Masters` into the established website URLs. `brand-source-manifest.json` records the original filename and SHA-256. Their embedded original fonts preserve the supplied optical positioning and shaping. Do not recolour, crop, retype or rebuild the logo geometry.

Safari can paint embedded-font wordmarks after the symbol. For site previews/footer images and PNG export, `assets/logos/web/` uses font-independent path exports of the approved R3 vector PDFs retained in `vendor/brand-r3`. `web-logo-manifest.json` records source/output hashes and PyMuPDF 1.26.5 conversion provenance. `scripts/prepare-web-logos.py` regenerates these delivery derivatives without typing, changing colours or redesigning the artwork. Existing original SVG paths remain available; site links request the R3 revision explicitly to avoid reusing a cached pre-Plex logo. The kit includes both original masters and delivery outlines.

A comparison with approved transparent PNG exports at their native 726 × 257 (English) and 621 × 257 (Arabic) sizes allowed two pixels for renderer differences. English missing/extra ink fractions were zero; the largest Arabic missing-ink fraction was 0.756% and extra-ink fraction 0.302%. The four derivatives were also visually inspected. This is a rendering-fidelity check, not a claim of byte identity with the editable originals.

The existing official symbol, icons, patterns and wallpapers are unchanged. Previous wordmarks remain in Git history. README and social-card compositions use the R3 originals on approved white with unchanged proportions.

Original IBM fonts and licences are copied from `05 Fonts and Licenses` into `vendor/ibm-plex`. `font-source-manifest.json` pins IBM/plex commit `71f558992315a12ca1f06a2215d57962a1992162` and upstream hashes. The compact web subsets were prepared by the existing Cave Accounts R3 process from those same originals; `assets/fonts/manifest.json` records source hashes, weights and retained shaping. Their family names are Cave UI Latin / Cave UI Arabic, respecting the OFL reserved font name. All eight real 400/500/600/700 faces and both notices are retained.

To regenerate the web subsets, install `fonttools[woff]` in an isolated temporary environment and run `python scripts/prepare-plex-fonts.py` from the repository root. This is an optional maintenance dependency, not a runtime or CI requirement. Review coverage and shaping before accepting regenerated output.

The kit contains the same site logos, icons and patterns, unmodified original TTFs and font notices, plus the existing proprietary brand licence. It excludes stationery, legal draft templates, native Affinity documents and legacy proprietary fonts. Those approved packages have separate review and use requirements.
