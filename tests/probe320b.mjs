import { launch, BASE, W, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 320, height: 700 } })).newPage();
await sample(pg);
await pg.goto(BASE + '/player/p003', W); await pg.waitForTimeout(700);
const wide = await pg.evaluate(() => {
  const vw = document.documentElement.clientWidth, out = [];
  document.querySelectorAll('body *').forEach((e) => {
    const r = e.getBoundingClientRect();
    if (r.right > vw - 1 || r.left < -1) { const cs = getComputedStyle(e); out.push(`${e.tagName}.${String(e.className).slice(0,50)} left=${Math.round(r.left)} right=${Math.round(r.right)} pos=${cs.position}`); }
  });
  return out.slice(0, 14);
});
console.log('vw=320'); console.log(wide.join('\n') || 'none');
await b.close();
