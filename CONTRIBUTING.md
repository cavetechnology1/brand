# Contributing

Open an issue for a broken asset, translation or layout problem. Include the page language, appearance, viewport/browser and expected versus actual result. Use fictional examples and remove account details from screenshots.

Make focused changes on a branch and keep English and Arabic in step. Preserve official marks, fixed product names and unrelated work. Asset updates need an approved source with a SHA-256 provenance entry; never approximate or retype the logo. Body text stays Regular; Arabic remains shaped RTL.

Run the README checks. When kit sources change, run `python3 scripts/build-kit.py` and commit the kit and checksum together. Inspect both languages on mobile and desktop, verify theme persistence, keyboard access and downloads, and record limitations honestly.

Use the pull request template. CI is disabled; document actual local checks. Do not add paid dependencies, enable CI or alter credentials, security/access settings, hosting ownership or production configuration. Deployment and public releases follow `docs/releasing.md`.

The existing brand and font licences apply. Contributions do not make Cave marks open source or grant endorsement.
