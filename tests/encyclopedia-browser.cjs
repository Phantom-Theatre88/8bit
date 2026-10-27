/* Reproducible rendered audit. No changes are made to lesson data or LOCKs. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'test-results');
const tabs = ['sim8bit','sim16bit','simdmx','ledcolormix','scroller','movinghead','netipaddress','netartnet','netbroadcast','netsacn','explain'];
const pages = ['index.html','Analog.html','SinglePhase3.html','Waveforms.html','ConvexLens.html','PersonLighting.html','DmxSpeed.html','History.html','HistoryMap.html',...tabs.map(t=>'Top.html?tab='+t)];
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server = http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'Not found':data);});
});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port+'/';
 const browser=await chromium.launch();const rows=[],checks=[];
 try {
 for(const [width,height] of [[1366,1024],[1366,900],[768,1024],[390,844]]){
  const page=await browser.newPage({viewport:{width,height}});
  for(const url of pages){
   const errors=[],missing=[];
   const onError=e=>errors.push(e.message),onResponse=r=>{if(r.status()>=400)missing.push(r.url())};
   page.on('pageerror',onError);page.on('response',onResponse);
   await page.goto(base+url);await page.waitForTimeout(350);
   const state=await page.evaluate(()=>{
    const visible=e=>!!e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
    return {width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
     images:[...document.images].filter(e=>visible(e)&&(!e.complete||!e.naturalWidth)).map(e=>e.getAttribute('src')),
     header:document.querySelector('.next-ui-console-header')?.getBoundingClientRect().toJSON(),
     active:[...document.querySelectorAll('.next-ui-category-tab.active')].map(e=>e.dataset.category),
     links:[...document.querySelectorAll('a[href]')].map(e=>e.href),
     teachers:[...document.images].filter(e=>visible(e)&&/teacher/.test(e.src)).map(e=>({src:e.getAttribute('src'),width:e.clientWidth,height:e.clientHeight}))};
   });
   if(url.startsWith('Top.html')){
    const key=new URL(url,base).searchParams.get('tab');
    const active=await page.locator('#main-tab-'+key).evaluate(e=>e.classList.contains('active'));
    if(!active)errors.push('Direct tab did not activate: '+key);
   }
   if(url!=='index.html'){
    if(await page.locator('.next-ui-category-tab').count()!==7)errors.push('Expected seven shared categories');
    const button=page.locator('[data-category="network"]');
    await button.click();if(await button.getAttribute('aria-expanded')!=='true')errors.push('Menu did not open');
    await page.keyboard.press('Escape');if(await button.getAttribute('aria-expanded')!=='false')errors.push('Escape did not close menu');
    if(await page.locator('[data-category-menu="network"] .next-ui-dropdown').isVisible())errors.push('Closed menu remains visible');
   }
   if(width===1366&&height===1024)await page.screenshot({path:path.join(out,url.replace(/[^a-z0-9]/gi,'_')+'.png')});
   rows.push({url,viewport:[width,height],errors,missing,...state});
   page.off('pageerror',onError);page.off('response',onResponse);
  }
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1366,height:1024}});
 const check=async(name,fn)=>{try{await fn();checks.push({name,pass:true})}catch(e){checks.push({name,pass:false,error:e.message})}};
 await page.goto(base+'Top.html?tab=sim8bit');await page.waitForTimeout(400);
 await check('8-bit values, bits and comparison preserve fader',async()=>{
  for(const value of [0,1,127,191,254,255]){
   await page.locator('#sim8bit-fader').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))},value);
   await page.locator('[data-sim8-view="digital"]').click();
   assert.equal(Number(await page.locator('#sim8bit-num-dmx').textContent()),value);
   const sum=await page.locator('.sim8-bit.on span').evaluateAll(es=>es.reduce((n,e)=>n+Number(e.textContent),0));assert.equal(sum,value);
   await page.locator('[data-sim8-view="wave"]').click();assert.equal(Number(await page.locator('#sim8bit-fader').inputValue()),value);
  }
 });
 await page.goto(base+'Top.html?tab=sim16bit');await page.waitForTimeout(400);
 await check('16-bit combinations and Fine limits',async()=>{
  for(const value of [0,1,255,256,32832,65534,65535]){
   await page.locator('#s16-master').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))},value);
   assert.equal(Number((await page.locator('#s16-total').textContent()).replaceAll(',','')),value);
   assert.equal(Number(await page.locator('#s16-coarse-value').textContent()),Math.floor(value/256));
   assert.equal(Number(await page.locator('#s16-fine-value').textContent()),value%256);
  }
  for(const [value,delta,want]of [[0,-1,0],[65535,1,65535],[255,1,256],[256,-1,255]]){
   const total=await page.evaluate(([value,delta])=>{const e=document.querySelector('#s16-master');e.value=value;e.dispatchEvent(new Event('input',{bubbles:true}));eval('Module_Sim16Bit').adjustFaderValue('fine',delta);return Number(document.querySelector('#s16-total').textContent.replaceAll(',',''))},[value,delta]);assert.equal(total,want);
  }
 });
 await page.goto(base+'History.html');await page.waitForTimeout(650);
 await check('History selection, source, teacher and empty-state clearing',async()=>{
  assert.ok((await page.locator('#detailBody').textContent()).length>20);
  assert.ok((await page.locator('#sourceNote').textContent()).length>5);
  assert.ok((await page.locator('#teacherSpeech').textContent()).length>5);
  await page.locator('.card').first().dispatchEvent('click');await page.waitForTimeout(450);
  assert.ok(!(await page.locator('#detailText').textContent()).includes('undefined'));
  await page.locator('#eraTrack').focus();await page.keyboard.press('End');await page.waitForTimeout(500);
  assert.equal(await page.locator('.card').count(),0);assert.equal(await page.locator('#sourceNote').textContent(),'');
 });
 await page.close();
 // All local navigation destinations and static dependencies must exist, including case.
 const links=[...new Set(rows.flatMap(r=>r.links))].filter(x=>x.startsWith(base));
 const badLinks=[];for(const link of links){const response=await fetch(link);if(!response.ok)badLinks.push(link)}
 const failures=rows.filter(r=>r.errors.length||r.missing.length||r.images.length||r.width>r.viewport[0]+2);
 fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({rows,checks,badLinks},null,2));
 console.log(JSON.stringify({pages:rows.length,checks,badLinks,failures},null,2));
 if(failures.length||badLinks.length||checks.some(c=>!c.pass))process.exitCode=1;
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
