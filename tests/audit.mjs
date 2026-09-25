import { launch, BASE, sample } from './lib.mjs';
const routes = [['home','/'],['start','/start'],['scout','/scout'],['list','/list'],['leagues','/leagues'],['league','/leagues/lg-sunday'],['how','/how'],['player','/player/p003'],['receipt','/receipt/p005'],['join','/join/LADS26'],['joinerr','/leagues?join=WRONGCODE']];
const views = [['m',390,844],['t',820,1180],['d',1280,800]];
const b = await launch();
const report = [];
for (const [vl,w,h] of views) {
  for (const [name,path] of routes) {
    const pg = await (await b.newContext({ viewport:{width:w,height:h} })).newPage();
    const errs = [], failed = [];
    pg.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,120)); });
    pg.on('pageerror', e => errs.push('PAGEERROR '+String(e).slice(0,120)));
    pg.on('requestfailed', r => failed.push(r.url().slice(0,100)+' '+(r.failure()?.errorText||'')));
    pg.on('response', r => { if (r.status()>=400) failed.push(r.status()+' '+r.url().slice(0,90)); });
    await sample(pg);
    await pg.evaluate(() => localStorage.setItem('rd_leagues_v1', JSON.stringify([{name:'Sunday Crew',code:'ABCDE',self:'sancho'}])));
    await pg.goto(BASE+path,{waitUntil:'networkidle',timeout:20000}).catch(e=>errs.push('NAV '+e.message.slice(0,80)));
    await pg.waitForTimeout(600);
    const fonts = await pg.evaluate(() => document.fonts ? [...document.fonts].map(f=>f.family+' '+f.status).filter(s=>!s.includes('loaded')).slice(0,5) : ['n/a']);
    await pg.screenshot({ path:`/tmp/audit/${vl}-${name}.png`, fullPage:false });
    if (errs.length||failed.length||fonts.length) report.push(`${vl}-${name}: errs=${JSON.stringify(errs.slice(0,3))} failed=${JSON.stringify(failed.slice(0,3))} fonts=${JSON.stringify(fonts)}`);
    await pg.close();
  }
  console.log(vl,'done');
}
console.log(report.length?report.join('\n'):'NO ERRORS ANYWHERE');
await b.close();
