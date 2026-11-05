"""Build/check the deterministic public brand kit using Python's standard library."""
from pathlib import Path
import hashlib, io, sys, zipfile
ROOT = Path(__file__).resolve().parents[1]
files = {'LICENSE.txt': ROOT / 'LICENSE.txt'}
for folder in ('logos', 'icons', 'patterns'):
    for file in sorted((ROOT / 'assets' / folder).rglob('*.svg')):
        files[folder + '/' + file.relative_to(ROOT / 'assets' / folder).as_posix()] = file
for file in sorted((ROOT / 'vendor/ibm-plex').iterdir()):
    files[f'fonts/{file.name}'] = file
buffer = io.BytesIO()
with zipfile.ZipFile(buffer, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name, file in sorted(files.items()):
        entry = zipfile.ZipInfo('cave-brand-kit/' + name, (2026, 11, 5, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, file.read_bytes())
content = buffer.getvalue()
checksum = f'{hashlib.sha256(content).hexdigest()}  cave-brand-kit.zip\n'.encode()
outputs = {ROOT / 'kit/cave-brand-kit.zip': content, ROOT / 'kit/SHA256SUMS': checksum}
for path, expected in outputs.items():
    if '--check' in sys.argv:
        if not path.exists() or path.read_bytes() != expected:
            sys.exit(f'Stale artifact: {path.relative_to(ROOT)}; run python3 scripts/build-kit.py')
    else:
        path.write_bytes(expected)
print(f'Kit {"verified" if "--check" in sys.argv else "built"}: {len(files)} files, {len(content):,} bytes')
