import { launch, BASE, sample } from './lib.mjs';
const b = await launch();
for (const [label, url, save] of [['leagues', '/leagues', true], ['joinerr', '/leagues?join=WRONGCODE', false]]) {
  const pg = await (await b.newContext({ viewport: { width: 320, height: 568 } })).newPage();
  await sample(pg);
  if (save) await pg.evaluate(() => localStorage.setItem('rd_leagues_v1', JSON.stringify([{ name: 'Sunday Crew', code: 'ABCDE', self: 'sancho' }])));
  await pg.goto(BASE + url, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
  const offenders = await pg.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > W + 0.5 || r.right > W + 0.5 || r.left < -0.5) {
        if (r.width > W + 0.5 || r.right > W + 0.5 || r.left < -0.5) out.push(`${el.tagName}.${String(el.getAttribute('class') || '').slice(0, 70)} w=${Math.round(r.width)} l=${Math.round(r.left)} r=${Math.round(r.right)}`);
        
      }
    }
    return { sw: document.documentElement.scrollWidth, W, out };
  });
  console.log(label, JSON.stringify(offenders, null, 1));
  await pg.close();
}
await b.close();
