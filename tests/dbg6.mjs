import { launch, BASE, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 320, height: 568 } })).newPage();
await sample(pg);
await pg.evaluate(() => localStorage.setItem('rd_leagues_v1', JSON.stringify([{ name: 'Sunday Crew', code: 'ABCDE', self: 'sancho' }])));
await pg.goto(BASE + '/leagues', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
const res = await pg.evaluate(() => {
  const sw = () => document.documentElement.scrollWidth;
  const base = sw();
  const reports = [];
  const candidates = document.querySelectorAll('main div.grid *');
  // hide top-level suspects: every direct child of the two inner grids and the outer grid
  const card=[...document.querySelectorAll('main div.grid.gap-4 > *')][0];
  const innerGrids=[card, ...card.querySelectorAll('form, label')];
  for (const g of innerGrids) {
    for (const child of [...g.children]) {
      const cls = String(child.getAttribute('class') || '').slice(0, 45);
      child.style.display = 'none';
      const after = sw();
      child.style.display = '';
      if (after < base) reports.push(`HIDING ${cls} -> sw=${after}`);
    }
  }
  return { base, reports: reports.slice(0, 10) };
});
console.log(JSON.stringify(res, null, 1));
await b.close();
