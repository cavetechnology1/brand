"""Offline source, link, licence and artifact checks. No third-party dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib, json, re, subprocess, sys
ROOT = Path(__file__).resolve().parents[1]
errors = []
def require(condition, message):
    if not condition: errors.append(message)
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = []; self.refs = []; self.lang = None; self.direction = None
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html': self.lang = attrs.get('lang'); self.direction = attrs.get('dir')
        if 'id' in attrs: self.ids.append(attrs['id'])
        for attr in ('src', 'href'):
            if attr in attrs: self.refs.append(attrs[attr])
for name, lang, direction in [('index.html','en','ltr'),('ar/index.html','ar','rtl'),('404.html','en','ltr')]:
    text = (ROOT / name).read_text(); page = Page(); page.feed(text)
    require(page.lang == lang and page.direction == direction, f'{name}: language/direction')
    require(len(page.ids) == len(set(page.ids)), f'{name}: duplicate IDs')
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc: continue
        if not url.path:
            if url.fragment: require(unquote(url.fragment) in page.ids, f'{name}: missing #{url.fragment}')
            continue
        target = ROOT / url.path.lstrip('/') if url.path.startswith('/') else ROOT / Path(name).parent / url.path
        require(target.exists() or target.with_suffix('.html').exists(), f'{name}: missing local asset {ref}')
    if name != '404.html':
        require('IBM Plex Sans Arabic' in text and 'IBM Plex Sans' in text, f'{name}: Plex guidance missing')
        require('Poppins' not in text and 'Almarai' not in text and 'Blue Ocean' not in text, f'{name}: retired typography')
        require('Beta' in text or 'تجريبية' in text, f'{name}: beta status missing')
for file in (ROOT / 'assets/css').glob('*.css'):
    for url in re.findall(r'url\(["\']?([^\)"\']+)',file.read_text()):
        if url.startswith('/'):
            require((ROOT / url.lstrip('/')).exists(), f'{file.name}: missing {url}')
fonts = ROOT / 'vendor/ibm-plex'
for item in json.loads((fonts / 'font-source-manifest.json').read_text())['files']:
    require(hashlib.sha256((fonts / item['name']).read_bytes()).hexdigest() == item['sha256'], f'Upstream font hash: {item["name"]}')
for item in json.loads((ROOT / 'assets/fonts/manifest.json').read_text()):
    require(hashlib.sha256((fonts / item['source']).read_bytes()).hexdigest() == item['sourceSha256'], f'Web font source: {item["file"]}')
    require((ROOT / 'assets/fonts' / item['file']).stat().st_size == item['bytes'], f'Web font size: {item["file"]}')
    require(item['shapingRetained'], f'Shaping: {item["file"]}')
for item in json.loads((ROOT / 'docs/brand-source-manifest.json').read_text())['files']:
    require(hashlib.sha256((ROOT / item['file']).read_bytes()).hexdigest() == item['sha256'], f'Approved asset hash: {item["file"]}')
for item in json.loads((ROOT / 'docs/web-logo-manifest.json').read_text()):
    require(hashlib.sha256((ROOT / item['source']).read_bytes()).hexdigest() == item['sourceSha256'], f'Approved PDF hash: {item["source"]}')
    svg = (ROOT / item['file']).read_text()
    require(hashlib.sha256(svg.encode()).hexdigest() == item['sha256'], f'Delivery SVG hash: {item["file"]}')
    require('<text' not in svg and '@font-face' not in svg and 'data:font' not in svg, f'Font-dependent delivery SVG: {item["file"]}')
for filename in ('plex-sans-LICENSE.txt','plex-sans-arabic-LICENSE.txt'):
    require((ROOT / 'assets/fonts' / filename).read_bytes() == (fonts / filename).read_bytes(), f'Font notice {filename}')
config = json.loads((ROOT / 'firebase.json').read_text())['hosting']
for excluded in ('vendor/**','docs/**','scripts/**','**/.*','*.md','LICENSE.txt','assets/fonts/Hero.*','assets/fonts/Poppins*.ttf','assets/fonts/Almarai*.ttf'):
    require(excluded in config['ignore'], f'Hosting exclusion missing: {excluded}')
for route in ('/', '/ar', '/404'):
    require(any(x.get('source') == route and {'key': 'Cache-Control', 'value': 'no-cache'} in x['headers'] for x in config['headers']), f'Clean-page cache rule missing: {route}')
require(not (ROOT / '.github/workflows').exists(), 'CI must remain disabled')
if errors:
    print('\n'.join(errors)); sys.exit(1)
subprocess.run([sys.executable,str(ROOT / 'scripts/build-kit.py'),'--check'],check=True)
print('PASS: bilingual local links, IDs, CSS assets, approved logo/font hashes, notices, hosting exclusions and kit consistency')
