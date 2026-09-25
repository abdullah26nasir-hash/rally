import { launch, BASE, sample } from './lib.mjs';
import fs from 'fs';
const axeSrc = fs.readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const b = await launch();
const pg = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await sample(pg);
await pg.goto(BASE + '/', { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(800);
await pg.evaluate(axeSrc);
const v = await pg.evaluate(async () => {
  const r = await window.axe.run(document, { runOnly: ['wcag2aa'] });
  return r.violations.filter(x => x.id === 'color-contrast').map(x => x.nodes.map(n => ({ target: n.target.join(' '), msg: (n.any[0]?.data?.fgColor || '') + ' on ' + (n.any[0]?.data?.bgColor || '') + ' = ' + (n.any[0]?.data?.contrastRatio || '?') }))).flat();
});
console.log(JSON.stringify(v, null, 1));
await b.close();
