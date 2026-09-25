import { launch, BASE, W, sample } from './lib.mjs';
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await sample(pg);
await pg.goto(BASE + '/', W); await pg.waitForTimeout(600);
const out = await pg.evaluate(() => {
  const el = [...document.querySelectorAll('.text-flare-ink')].find(e => String(e.getAttribute('class')).includes('text-[12px]') && String(e.getAttribute('class')).includes('truncate'));
  if (!el) return 'not found';
  let chain = [];
  let n = el;
  while (n && n !== document.body) { chain.push(n.tagName + '.' + (String(n.getAttribute('class')||'').slice(0, 70))); n = n.parentElement; }
  const cs = getComputedStyle(el);
  return JSON.stringify({ color: cs.color, chain: chain.slice(0, 14) }, null, 1);
});
console.log(out);
await b.close();
