"""Export font-independent delivery SVGs from approved R3 PDFs; retain original masters.
Optional tooling: PyMuPDF 1.26.5 in an isolated environment. No runtime dependency.
"""
from pathlib import Path
import hashlib, json
import pymupdf
ROOT = Path(__file__).resolve().parents[1]
manifest = []
for language in ('en', 'ar'):
    for color in ('color', 'white'):
        source = f'vendor/brand-r3/cave-{language}-{color}.pdf'
        target = f'assets/logos/web/cave-logo-{language}-{color}-compact.svg'
        with pymupdf.open(ROOT / source) as document:
            assert len(document) == 1
            svg = document[0].get_svg_image(text_as_path=True)
        assert '<text' not in svg and '@font-face' not in svg
        (ROOT / target).parent.mkdir(parents=True, exist_ok=True)
        (ROOT / target).write_text(svg)
        manifest.append({'source': source, 'sourceSha256': hashlib.sha256((ROOT / source).read_bytes()).hexdigest(),
                         'file': target, 'sha256': hashlib.sha256(svg.encode()).hexdigest(),
                         'method': 'PyMuPDF ' + pymupdf.VersionBind + ' get_svg_image(text_as_path=True)',
                         'note': 'Font-independent delivery derivative of approved R3 vector PDF; original editable SVG master retained unchanged.'})
(ROOT / 'docs/web-logo-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print('Exported four font-independent delivery SVGs from approved PDFs.')
