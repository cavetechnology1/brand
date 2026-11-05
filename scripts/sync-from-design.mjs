// Copies the design-system styles this site uses.
//   node scripts/sync-from-design.mjs           write tokens.css and components.css
//   node scripts/sync-from-design.mjs --check   exit 1 if the copies have drifted
// Needs a sibling design.cave.technology checkout (CAVE_DESIGN_DIR overrides the path); no build step.
//   tokens.css      generated from source/tokens.json, the same function the design site uses
//   components.css  source/components/bundle.css, the product-pattern bundle (footer, powered-by, ...)
// Brand-only values (such as the Plex font families) belong in assets/css/brand.css, not in these copies.
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.resolve(process.env.CAVE_DESIGN_DIR || path.join(ROOT, '..', 'design.cave.technology'));
const check = process.argv.includes('--check');

let sources;
try {
  const {buildTokensCss} = await import(pathToFileURL(path.join(DESIGN, 'src', 'tokens.mjs')));
  const tokens = JSON.parse(await readFile(path.join(DESIGN, 'source', 'tokens.json'), 'utf8'));
  sources = {
    'tokens.css': `/* Cave design tokens. Generated from tokens.json. Do not edit by hand. */\n${buildTokensCss(tokens)}\n`,
    'components.css': await readFile(path.join(DESIGN, 'source', 'components', 'bundle.css'), 'utf8'),
  };
} catch (error) {
  console.error(`Could not read the design system at ${DESIGN}: ${error.message}`);
  process.exit(2);
}

let drifted = false;
for (const [name, source] of Object.entries(sources)) {
  const to = path.join(ROOT, 'assets', 'css', name);
  const current = await readFile(to, 'utf8').catch(() => '');
  if (current === source) { console.log(`ok       ${name}`); continue; }
  if (check) { console.error(`drifted  ${name}`); drifted = true; continue; }
  await writeFile(to, source);
  console.log(`updated  ${name}`);
}
process.exit(drifted ? 1 : 0);
