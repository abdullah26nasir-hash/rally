import { launch, BASE, W, sample, axe, smallTargets } from './lib.mjs';
import fs from 'fs';
const routes = [
  ['home','/'],['start','/start'],['scout','/scout'],['list','/list'],
  ['leagues','/leagues'],['league','/leagues/lg-sunday'],['how','/how'],
  ['player','/player/p003'],['receipt','/receipt/p005'],
  ['join','/join/LADS26'],['joinerr','/leagues?join=WRONGCODE'],['notfound','/definitely-not-a-route']
];
const views = [['m',390,844],['t',820,1180],['d',1280,900]];
fs.mkdirSync('/tmp/bigaudit', { recursive: true });
const b = await launch();
const report = [];
for (const [vl,w,h] of views) {
  for (const mode of ['fresh','sampled']) {
    for (const [name,path] of routes) {
      if (mode==='fresh' && !['home','start','scout','list','leagues','how','notfound'].includes(name)) continue;
      const pg = await (await b.newContext({ viewport:{width:w,height:h} })).newPage();
      const errs=[], failed=[];
      pg.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,140)); });
      pg.on('pageerror', e => errs.push('PAGEERROR '+String(e).slice(0,140)));
      pg.on('requestfailed', r => failed.push(r.url().slice(0,100)+' '+(r.failure()?.errorText||'')));
      pg.on('response', r => { if (r.status()>=400) failed.push(r.status()+' '+r.url().slice(0,90)); });
      if (mode==='sampled') {
        await sample(pg);
        await pg.evaluate(() => localStorage.setItem('rd_leagues_v1', JSON.stringify([{name:'Sunday Crew',code:'ABCDE',self:'sancho'}])));
      } else {
        await pg.goto(BASE+'/',W); await pg.evaluate(() => { localStorage.clear(); localStorage.setItem('rally-analytics-consent','no'); });
      }
      await pg.goto(BASE+path,{waitUntil:'networkidle',timeout:20000}).catch(e=>errs.push('NAV '+e.message.slice(0,80)));
      await pg.waitForTimeout(700);
      const tag = `${vl}-${mode}-${name}`;
      const overflow = await pg.evaluate(() => { const d=document.documentElement; return d.scrollWidth - d.clientWidth; });
      const small = await smallTargets(pg);
      const ax = await axe(pg);
      const copy = await pg.evaluate(() => document.body.innerText);
      fs.writeFileSync(`/tmp/bigaudit/${tag}.txt`, copy);
      await pg.screenshot({ path:`/tmp/bigaudit/${tag}.png`, fullPage:false });
      const problems = [];
      if (errs.length) problems.push('errs='+JSON.stringify(errs.slice(0,3)));
      if (failed.length) problems.push('failed='+JSON.stringify(failed.slice(0,3)));
      if (overflow > 1) problems.push('overflowX='+overflow);
      if (small.length) problems.push('small='+JSON.stringify(small.slice(0,6)));
      if (ax.length) problems.push('axe='+JSON.stringify(ax.slice(0,6)));
      if (problems.length) report.push(tag+': '+problems.join(' '));
      await pg.close();
    }
    console.log(vl, mode, 'done');
  }
}
fs.writeFileSync('/tmp/bigaudit/report.txt', report.join('\n') || 'CLEAN');
console.log(report.length ? report.join('\n') : 'CLEAN');
await b.close();
