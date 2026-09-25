import { launch, BASE, W, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 320, height: 700 } })).newPage();
await sample(pg);
await pg.goto(BASE + '/player/p003', W); await pg.waitForTimeout(700);
const wide = await pg.evaluate(() => {
  const vw = document.documentElement.clientWidth, out = [];
  document.querySelectorAll('*').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width > vw + 1 || r.right > vw + 1) out.push(`${e.tagName}.${String(e.className).slice(0,60)} w=${Math.round(r.width)} right=${Math.round(r.right)}`); });
  return out.slice(0, 10);
});
console.log(wide.join('\n') || 'none');
await b.close();
