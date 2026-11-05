"""Create compact EN/AR web delivery subsets from the approved, retained IBM sources.
Requires fonttools[woff]. Subset family names avoid the OFL Reserved Font Name Plex.
Glyph designs and shaping features are retained; source hashes and licenses stay alongside.
"""
from pathlib import Path
import json
import hashlib
from fontTools.ttLib import TTFont
from fontTools import subset

source = Path('vendor/ibm-plex')
output = Path('assets/fonts')
output.mkdir(parents=True, exist_ok=True)
ranges = [(0, 0x024F), (0x0600, 0x08FF), (0x1E00, 0x1EFF),
          (0x2000, 0x206F), (0x20A0, 0x20CF), (0x2190, 0x21FF),
          (0xFB50, 0xFDFF), (0xFE70, 0xFEFF), (0xFFFD, 0xFFFD)]
coverage = [c for start, end in ranges for c in range(start, end + 1)]
manifest = []
for script, original, family in [('latin', 'IBMPlexSans', 'Cave UI Latin'),
                                  ('arabic', 'IBMPlexSansArabic', 'Cave UI Arabic')]:
    for weight, style in [(400, 'Regular'), (500, 'Medium'), (600, 'SemiBold'), (700, 'Bold')]:
        path = source / f'{original}-{style}.ttf'
        font = TTFont(path, recalcTimestamp=False)
        options = subset.Options()
        options.layout_features = ['*']
        options.name_IDs = ['*']
        options.name_legacy = True
        options.name_languages = ['*']
        sub = subset.Subsetter(options=options)
        sub.populate(unicodes=coverage)
        sub.subset(font)
        names = {1: family, 2: style, 3: f'{family}-{style}-R3-subset',
                 4: f'{family} {style}', 6: f'CaveUI{script.title()}-{style}',
                 16: family, 17: style, 18: f'{family} {style}'}
        for entry in list(font['name'].names):
            if entry.nameID in names:
                font['name'].setName(names[entry.nameID], entry.nameID,
                                     entry.platformID, entry.platEncID, entry.langID)
        font.flavor = 'woff2'
        dest = output / f'cave-ui-{script}-{weight}.woff2'
        font.save(dest)
        manifest.append({'source': path.name, 'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                         'file': dest.name, 'bytes': dest.stat().st_size, 'family': family,
                         'weight': weight, 'unicodeCount': len(font.getBestCmap()), 'shapingRetained': 'GSUB' in font})
(output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))
