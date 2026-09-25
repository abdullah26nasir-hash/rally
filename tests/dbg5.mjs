import { launch, BASE, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 320, height: 568 } })).newPage();
await sample(pg);
await pg.evaluate(() => localStorage.setItem('rd_leagues_v1', JSON.stringify([{ name: 'Sunday Crew', code: 'ABCDE', self: 'sancho' }])));
await pg.goto(BASE + '/leagues', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
const info = await pg.evaluate(() => {
  const main = document.querySelector('main');
  const root = main.firstElementChild;
  const out = { rootCls: root.getAttribute('class'), rootW: root.getBoundingClientRect().width, rootDisplay: getComputedStyle(root).display };
  const kids = [...root.children].map(k => `${k.tagName}.${String(k.getAttribute('class')||'').slice(0,40)} w=${Math.round(k.getBoundingClientRect().width)}`);
  out.kids = kids;
  return out;
});
console.log(JSON.stringify(info, null, 1));
await b.close();
