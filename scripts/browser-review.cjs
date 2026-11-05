// Optional local acceptance check; supply an installed Playwright module (no CI or runtime dependency).
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const origin = process.env.BRAND_PREVIEW_URL || 'http://127.0.0.1:8765';
const output = path.resolve('.local/browser-review'); fs.mkdirSync(output,{recursive:true});
const csp = JSON.parse(fs.readFileSync('firebase.json')).hosting.headers.flatMap(x=>x.headers).find(x=>x.key==='Content-Security-Policy').value;
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const results=[];
 try {
  for(const language of ['en','ar']) for(const width of [320,390,1440]) for(const theme of ['light','dark','black','system']) {
   const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true});
   await context.addInitScript(theme=>localStorage.setItem('cave-brand-theme',theme),theme);
   await context.route('**/*',async route=>{
    if(!route.request().url().startsWith(origin+'/'))return route.abort();
    const response=await route.fetch();return route.fulfill({response,headers:{...response.headers(),'content-security-policy':csp}});
   });
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+(language==='ar'?'/ar/':'/'));
   await page.evaluate(()=>document.fonts.ready);
   // Force lazy wallpaper assets into view before checking image decode.
   await page.locator('#wallpapers').scrollIntoViewIfNeeded();
   await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
   const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,language:document.documentElement.lang,dir:document.documentElement.dir,bodyWeight:getComputedStyle(document.body).fontWeight,font:getComputedStyle(document.body).fontFamily,headingWeight:getComputedStyle(document.querySelector('h1')).fontWeight,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),theme:document.documentElement.dataset.theme}));
   assert.equal(metrics.width,width); assert.ok(metrics.scroll<=width,JSON.stringify(metrics));assert.equal(metrics.bodyWeight,'400');assert.equal(metrics.headingWeight,language==='ar'?'700':'600');assert.ok(metrics.font.includes(language==='ar'?'Cave UI Arabic':'Cave UI Latin'));assert.ok(metrics.fonts.some(f=>f.includes(language==='ar'?'Cave UI Arabic':'Cave UI Latin')));assert.ok(metrics.images);assert.equal(errors.length,0,errors.join('\n'));
   await page.getByRole('button',{name:language==='ar'?/المظهر/:/Theme/}).click();
   await page.locator(`input[name="theme"][value="${theme}"]`).check();
   await page.keyboard.press('Escape');
   for(let i=0;i<6;i++) {
    const card=page.locator('.ground').nth(i);const original=await card.locator('select').inputValue();await card.locator('select').selectOption(i%2?'teal':'paper');
    const download=page.waitForEvent('download');await card.getByRole('button').click();const file=await (await download).path();
    const data=fs.readFileSync(file);assert.equal(data.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(data.readUInt32BE(16),1600);await card.locator('select').selectOption(original);
   }
   await page.getByRole('button',{name:language==='ar'?'نسخ اللون: teal #179d9f':'Copy color: teal #179d9f',exact:true}).click();
   await page.locator('.brand-tool-status').filter({hasText:'#179d9f'}).waitFor();
   await page.locator('.skip-link').focus();assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),true);
   await page.locator('.brand').focus();
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:path.join(output,`${language}-${width}-${theme}.png`)});
   results.push({language,width,theme,metrics,pngExports:6,copyColor:true,keyboardFocus:true,errors});
   await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');console.log(`PASS ${results.length} bilingual/viewport/theme cases; ${results.length*6} transparent PNG exports; production CSP preserved`);
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
