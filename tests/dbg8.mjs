import { launch, BASE, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 320, height: 568 } })).newPage();
await sample(pg);
await pg.evaluate(() => localStorage.setItem('rally-consent','yes'));
await pg.goto(BASE + '/', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
const out = await pg.evaluate(() => {
  const W = document.documentElement.clientWidth, drivers = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.right <= W + 0.5 && r.left >= -0.5) continue;
    let clipped = false, n = el.parentElement;
    while (n) { const o = getComputedStyle(n).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll') { clipped = true; break; } n = n.parentElement; }
    if (!clipped) drivers.push(`${el.tagName}.${String(el.getAttribute('class')||'').slice(0,55)} l=${Math.round(r.left)} r=${Math.round(r.right)}`);
    if (drivers.length >= 10) break;
  }
  return { sw: document.documentElement.scrollWidth, W, drivers };
});
console.log(JSON.stringify(out, null, 1));
await b.close();
