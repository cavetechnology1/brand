// Local responsive-navigation regression checks; optional QA dependencies only.
const pw=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const engine=process.env.BRAND_BROWSER || 'chromium',origin=process.env.BRAND_PREVIEW_URL || 'http://127.0.0.1:8765';
const out=path.resolve('.local/navigation-review',engine);fs.mkdirSync(out,{recursive:true});
const axe=fs.readFileSync(process.env.AXE_SCRIPT || require.resolve('axe-core/axe.min.js'),'utf8');
const csp=JSON.parse(fs.readFileSync('firebase.json')).hosting.headers.flatMap(x=>x.headers).find(x=>x.key==='Content-Security-Policy').value;
(async()=>{const b=await pw[engine].launch(engine==='chromium'?{headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{headless:true});const rows=[];
try{for(const language of ['en','ar'])for(const width of [320,390,768,1024,1025,1440])for(const theme of ['light','dark']){
 const c=await b.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
 await c.route('**/*',async route=>{if(!route.request().url().startsWith(origin+'/'))return route.abort();const response=await route.fetch();return route.fulfill({response,headers:{...response.headers(),'content-security-policy':csp}})});
 await c.addInitScript(t=>localStorage.setItem('cave-brand-theme',t),theme);
 const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+(language==='ar'?'/ar/':'/'));await p.evaluate(()=>document.fonts.ready);
 const menu=p.locator('#nav-toggle'),nav=p.locator('#brand-navigation');const mobile=width<=1024;
 assert.equal(await menu.isVisible(),mobile);assert.equal(await nav.isVisible(),!mobile);
 const audit=async label=>{await p.evaluate(axe);const r=await p.evaluate(async()=>{const a=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}});return {violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),incomplete:a.incomplete.map(v=>v.id)}});assert.deepEqual(r.violations,[],label+JSON.stringify(r.violations));return r;};
 const closedAudit=await audit('closed');let openAudit=null,nestedAudit=null;
 if(mobile){
  assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await menu.getAttribute('aria-controls'),'brand-navigation');assert.equal(await menu.getAttribute('aria-label'),language==='ar'?'فتح القائمة':'Open menu');
  const header=await p.locator('.top').boundingBox();assert.ok(header.height<=66,header.height);
  await menu.focus();await p.keyboard.press('Space');assert.equal(await menu.getAttribute('aria-expanded'),'true');assert.equal(await menu.getAttribute('aria-label'),language==='ar'?'إغلاق القائمة':'Close menu');assert.ok(await nav.isVisible());
  await p.keyboard.press(engine==='webkit'?'Alt+Tab':'Tab');assert.ok(await nav.locator('a').first().evaluate(e=>e===document.activeElement));
  openAudit=await audit('open');
  await p.screenshot({path:path.join(out,`${language}-${width}-${theme}-open.png`)});
  const themeButton=p.locator('#theme-button');await themeButton.click();nestedAudit=await audit('nested');await p.keyboard.press('Escape');assert.equal(await themeButton.getAttribute('aria-expanded'),'false');assert.equal(await menu.getAttribute('aria-expanded'),'true');assert.ok(await themeButton.evaluate(e=>e===document.activeElement));
  await p.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.ok(await menu.evaluate(e=>e===document.activeElement));assert.ok(await nav.isHidden());
  await menu.click();const panelBox=await nav.boundingBox();await p.mouse.click(4,panelBox.y+8);assert.ok(await nav.isHidden());
  await menu.click();await p.locator('.nav a[href="#type"]').click();assert.ok(await nav.isHidden());assert.ok(await p.locator('#type').evaluate(e=>e===document.activeElement));
  let geometry=await p.evaluate(()=>({top:document.querySelector('#type').getBoundingClientRect().top,header:document.querySelector('.top').getBoundingClientRect().bottom}));assert.ok(geometry.top>=geometry.header-1,JSON.stringify(geometry));
  await menu.click();await p.locator('.hero a[download]').focus();assert.ok(await nav.isHidden());
  await menu.click();await p.locator('.nav a').first().focus();await p.setViewportSize({width:1440,height:844});await p.waitForFunction(()=>document.querySelector('#nav-toggle').hidden&&!document.querySelector('#brand-navigation').hidden);assert.ok(await nav.isVisible());assert.ok(await menu.isHidden());
  await p.setViewportSize({width,height:844});await p.waitForFunction(()=>document.querySelector('#brand-navigation').hidden);assert.ok(await menu.evaluate(e=>e===document.activeElement));
  await menu.click();await p.setViewportSize({width,height:320});await p.locator('#theme-button').click();await p.locator('#theme-options input[value="black"]').focus();assert.ok(await p.locator('#theme-options input[value="black"]').evaluate(e=>{const a=e.getBoundingClientRect(),n=document.querySelector('#brand-navigation').getBoundingClientRect();return a.top>=n.top&&a.bottom<=n.bottom&&n.bottom<=innerHeight+1}));await p.keyboard.press('Escape');await p.keyboard.press('Escape');await p.setViewportSize({width,height:844});
 }else{assert.equal(await nav.locator('a').count(),9);}
 await p.locator('.brand').focus();await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:path.join(out,`${language}-${width}-${theme}-closed.png`)});
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 rows.push({engine,version:b.version(),language,width,theme,mobile,closedAudit,openAudit,nestedAudit,keyboard:true,focus:true,resize:true,shortViewport:true,errors});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(rows,null,2)+'\n');await c.close();
}
// Progressive enhancement keeps both language navigations usable without JavaScript.
for(const language of ['en','ar']){const c=await b.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}});const p=await c.newPage();await p.goto(origin+(language==='ar'?'/ar/':'/'));assert.ok(await p.locator('#brand-navigation').isVisible());assert.ok(await p.locator('#nav-toggle').isHidden());assert.equal(await p.locator('#brand-navigation a').count(),9);await c.close();}
console.log(`PASS ${engine}: ${rows.length} responsive navigation cases and two no-JavaScript language fallbacks`);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
