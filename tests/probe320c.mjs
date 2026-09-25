import { launch, BASE, W, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 320, height: 700 } })).newPage();
await sample(pg);
await pg.goto(BASE + '/player/p003', W); await pg.waitForTimeout(700);
const out = await pg.evaluate(() => {
  const hits = [];
  const walk = (e, depth) => {
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) {
      hits.push(`${' '.repeat(depth)}${e.tagName}.${String(e.className).slice(0,55)} sw=${e.scrollWidth} cw=${e.clientWidth}`);
      [...e.children].forEach((c) => walk(c, depth + 1));
    }
  };
  [...document.body.children].forEach((c) => walk(c, 0));
  return hits.slice(0, 20);
});
console.log(out.join('\n') || 'none');
await b.close();
