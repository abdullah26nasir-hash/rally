import { launch, BASE, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 320, height: 568 } })).newPage();
await sample(pg);
await pg.evaluate(() => localStorage.setItem('rd_leagues_v1', JSON.stringify([{ name: 'Sunday Crew', code: 'ABCDE', self: 'sancho' }])));
await pg.goto(BASE + '/leagues', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
const info = await pg.evaluate(() => {
  const main = document.querySelector('main');
  const body = document.body;
  const root = document.documentElement;
  const chain = [];
  let n = main;
  while (n && chain.length < 6) { const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); chain.push(`${n.tagName}.${String(n.getAttribute('class')||'').slice(0,50)} w=${Math.round(r.width)} ml=${cs.marginLeft} mr=${cs.marginRight} pl=${cs.paddingLeft} pr=${cs.paddingRight}`); n = n.parentElement; }
  return { mainW: main.getBoundingClientRect().width, bodyW: body.getBoundingClientRect().width, rootW: root.clientWidth, chain };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
