# Manual beta release checklist

Candidate: **v0.2.0-beta.1 — Cave Brand Plex R3**. Do not tag, deploy or publish until the exact commit, artifacts, checks and limitations have been reviewed and the owner has been informed.

1. Confirm `main` contains only the reviewed changes and is synchronized without force pushing. Record its full SHA.
2. Run the README checks and complete the bilingual desktop/mobile and appearance review. Record browser coverage and remaining limitations in `docs/validation.md`.
3. Verify `kit/cave-brand-kit.zip` and `kit/SHA256SUMS` against the same commit. The kit is the intended downloadable release asset; GitHub also generates source archives for a tag. Do not include local fixtures, credentials or unrelated packages.
4. Review the final release notes with the owner. Mark the GitHub release **prerelease** and keep the beta label. Describe exact scope, font/brand licensing and known limitations; do not imply a website deployment.
5. Only after separate deployment authorization, deploy the exact reviewed site artifact to the existing Hosting target. Keep all existing security headers and deployment exclusions. Verify `/`, `/ar`, 404, font/image loads, typography, themes, kit/checksum and HTTPS after deployment; retain the previous Hosting version for rollback.
6. After the owner transfers GitHub ownership, verify repository links and hosting integrations. Repository transfer, Firebase ownership and security settings are outside this update.

Suggested release notes:

> Bilingual Cave Brand beta aligned with the approved Plex R3 identity. English uses IBM Plex Sans; Arabic uses IBM Plex Sans Arabic, with Regular body text and real role weights. Includes exact approved wordmarks, typography samples, the refreshed kit, checksums and maintainer guidance. The original symbol, colours, icons, patterns and wallpapers are retained. Cave marks remain proprietary; IBM fonts retain OFL notices. This release describes the tagged source and attached kit. Check the recorded deployment status and browser limitations before relying on the live website.
