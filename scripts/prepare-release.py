"""Prepare a reviewable, exact beta Hosting bundle. This never deploys, tags or publishes."""
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, zipfile
ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--version', default='v0.2.0-beta.1')
args = parser.parse_args()
assert args.version == 'v0.2.0-beta.1', 'Review the candidate version before changing it.'
status = subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True)
if status.strip(): raise SystemExit('Commit the reviewed source before preparing the exact release bundle.')
commit = subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
subprocess.run(['python3','scripts/check.py'],cwd=ROOT,check=True)
out = ROOT / '.local/releases' / (args.version + '-' + commit[:12])
if out.exists(): raise SystemExit(f'Bundle already exists: {out}; verify it instead of overwriting it.')
public = out / 'hosting/public'
public.mkdir(parents=True)
paths = [Path(x) for x in ['index.html','ar/index.html','404.html','robots.txt','sitemap.xml','kit/cave-brand-kit.zip','kit/SHA256SUMS']]
for file in sorted((ROOT/'assets').rglob('*')):
    if not file.is_file(): continue
    rel=file.relative_to(ROOT)
    if any(x.startswith('.') for x in rel.parts): continue
    if rel.parent == Path('assets/fonts') and file.name.startswith(('Hero.','Poppins','Almarai')): continue
    paths.append(rel)
files = []
for rel in sorted(paths):
    target = public / rel; target.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(ROOT / rel,target)
    files.append({'path':'public/'+rel.as_posix(),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
config = json.loads((ROOT/'firebase.json').read_text()); config['hosting']['public']='public'
assert json.loads((ROOT/'.firebaserc').read_text())['projects']['default']=='cave-brand-kit'
(out/'hosting/firebase.json').write_text(json.dumps(config,indent=2)+'\n')
shutil.copyfile(ROOT/'.firebaserc',out/'hosting/.firebaserc')
(out/'hosting/FILES.json').write_text(json.dumps({'sourceCommit':commit,'files':files},indent=2)+'\n')
archive = out / f'cave-brand-site-{args.version}-{commit[:12]}.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as bundle:
    for file in sorted((out/'hosting').rglob('*')):
        if not file.is_file(): continue
        entry=zipfile.ZipInfo(file.relative_to(out/'hosting').as_posix(),(2026,11,5,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED;entry.external_attr=0o100644<<16
        bundle.writestr(entry,file.read_bytes())
shutil.copyfile(ROOT/'kit/cave-brand-kit.zip',out/'cave-brand-kit.zip')
shutil.copyfile(ROOT/'kit/SHA256SUMS',out/'SHA256SUMS')
sha=hashlib.sha256(archive.read_bytes()).hexdigest()
(out/'DEPLOYMENT_SHA256SUMS').write_text(f'{sha}  {archive.name}\n')
kitsha=hashlib.sha256((out/'cave-brand-kit.zip').read_bytes()).hexdigest()
manifest={'candidate':args.version,'sourceCommit':commit,'hostingProject':'cave-brand-kit','hostingSite':'cave-brand-kit','domain':'brand.cave.technology','siteArchive':archive.name,'siteArchiveBytes':archive.stat().st_size,'siteArchiveSha256':sha,'publicFiles':len(files),'kitBytes':(out/'cave-brand-kit.zip').stat().st_size,'kitSha256':kitsha,'deployed':False,'tagCreated':False,'githubReleaseCreated':False,'repositoryTransferred':False,'requiresAdvanceOwnerNotice':True,'excluded':['scripts','docs','vendor','repository metadata','local QA evidence','retired fonts','credentials','functions','rules','security/access changes']}
(out/'RELEASE.json').write_text(json.dumps(manifest,indent=2)+'\n')
(out/'DEPLOYMENT_SCOPE.md').write_text(f'''# Exact beta scope — {args.version}\n\nSource commit: `{commit}`.\n\nHosting target: existing `cave-brand-kit` site/project, custom domain `brand.cave.technology`. The archive contains only the reviewed static `public/` tree, equivalent Hosting configuration, existing project binding and a per-file hash manifest outside the public tree. Security headers are unchanged. No Functions, database rules, credentials, access settings, CI, paid services or ownership changes are included.\n\nSite archive: `{archive.name}` ({archive.stat().st_size:,} bytes). SHA-256: `{sha}`.\n\nAttached GitHub prerelease assets would be `cave-brand-kit.zip` ({(out/'cave-brand-kit.zip').stat().st_size:,} bytes; SHA-256 `{kitsha}`) and `SHA256SUMS`, plus GitHub's tag source archives. The Hosting archive is a deployment handoff, not an additional public release attachment.\n\nDo not deploy, tag or publish until the owner has been informed of this exact scope. After authorization, deploy Hosting only from the extracted `hosting/` directory using its reviewed `firebase.json` and explicit project `cave-brand-kit`. Verify public routes, HTTPS, asset/font loads, appearance, kit checksum and response headers, retaining the previous Hosting version for rollback. A GitHub prerelease and a website deployment are separate operations.\n\nPhysical iOS/Android devices and human screen-reader acceptance remain unverified. Automated audits and responsive emulation do not establish full accessibility compliance.\n''')
(out/'RELEASE_NOTES.md').write_text(f'''# Cave Brand Plex R3 — {args.version}\n\n**Beta / prerelease.** Source: `{commit}`.\n\n- IBM Plex Sans for English and IBM Plex Sans Arabic for Arabic, with real role weights and Regular body copy.\n- Approved original R3 wordmark masters retained, with matching font-independent outlines for reliable Safari previews and PNG export.\n- Accessible responsive navigation with a labelled mobile menu, keyboard/focus handling and a no-JavaScript fallback.\n- Bilingual typography guidance, exact brand sources, refreshed kit, font notices and checksums.\n- Improved README, contribution/release guidance, issue forms and PR template; CI remains disabled.\n- Better Dark/Black icon-link contrast, descriptive PNG control names, keyboard skip-link focus and heading clearance below the sticky navigation.\n\nValidation: native Safari desktop and 320/390 px responsive review; Chromium, Firefox and WebKit responsive/theme/download checks; automated WCAG/axe and keyboard checks. See the repository validation record for scope and limitations. Cave marks remain proprietary; IBM fonts retain OFL notices.\n\nThis release describes its tagged source and attached kit. Website deployment is a separate action. Physical-device and human screen-reader acceptance remain open; this is not a full accessibility certification.\n''')
print(json.dumps({'directory':str(out),**manifest},indent=2))
