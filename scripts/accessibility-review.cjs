// Optional local QA. Supply existing Playwright and axe-core paths; no runtime dependency or CI.
const pw=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const engine=process.env.BRAND_BROWSER || 'chromium';
const origin=process.env.BRAND_PREVIEW_URL || 'http://127.0.0.1:8765';
const out=path.resolve('.local/accessibility-review',engine);fs.mkdirSync(out,{recursive:true});
const axe=fs.readFileSync(process.env.AXE_SCRIPT || require.resolve('axe-core/axe.min.js'),'utf8');
const csp=JSON.parse(fs.readFileSync('firebase.json')).hosting.headers.flatMap(x=>x.headers).find(x=>x.key==='Content-Security-Policy').value;
(async()=>{const b=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}:{headless:true});const rows=[];
try{for(const language of ['en','ar'])for(const width of [320,1440])for(const theme of ['light','dark','black']){
 const context=await b.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
 await context.route('**/*',async route=>{if(!route.request().url().startsWith(origin+'/'))return route.abort();const response=await route.fetch();return route.fulfill({response,headers:{...response.headers(),'content-security-policy':csp}})});
 await context.addInitScript(t=>localStorage.setItem('cave-brand-theme',t),theme);
 const p=await context.newPage();await p.goto(origin+(language==='ar'?'/ar/':'/'));await p.evaluate(()=>document.fonts.ready);
 const toggle=p.locator('#theme-button');await toggle.focus();await p.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-expanded'),'true');
 assert.ok(await p.locator('#theme-options input:checked').evaluate(e=>e===document.activeElement));
 const before=await p.locator('#theme-options input:checked').inputValue();await p.keyboard.press(before==='black'?'ArrowUp':'ArrowDown');const after=await p.locator('#theme-options input:checked').inputValue();assert.notEqual(before,after);
 await p.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.ok(await toggle.evaluate(e=>e===document.activeElement));
 await p.keyboard.press(engine==='webkit'?'Alt+Tab':'Tab');assert.ok(await p.locator('.hero a[download]').evaluate(e=>e===document.activeElement),await p.evaluate(()=>document.activeElement.outerHTML));
 await toggle.click();await p.locator(`input[name="theme"][value="${theme}"]`).check();await p.keyboard.press('Escape');
 await p.locator('.skip-link').focus();await p.keyboard.press('Enter');assert.ok(await p.locator('#main').evaluate(e=>e===document.activeElement));
 await p.locator('.nav a[href="#type"]').click();
 const anchor=await p.evaluate(()=>({target:document.querySelector('#type').getBoundingClientRect().top,header:document.querySelector('.top').getBoundingClientRect().bottom}));assert.ok(anchor.target>=anchor.header-1,JSON.stringify(anchor));
 await p.evaluate(axe);
 const audit=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}});return {version:r.testEngine.version,violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),passes:r.passes.length}});
 rows.push({engine,browserVersion:b.version(),language,width,theme,keyboardTheme:true,escapeFocus:true,tabOrder:true,skipToMain:true,anchor,...audit});
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2)+'\n');assert.deepEqual(audit.violations,[],JSON.stringify(audit.violations));
 await context.close();
}console.log(`PASS ${engine}: ${rows.length} accessibility cases, keyboard theme/escape/tab/skip links, clear anchor headings, zero axe violations`)}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
