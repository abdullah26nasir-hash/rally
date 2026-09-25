import { launch, BASE, W } from './lib.mjs';
const b = await launch();
for (const [name, vw, vh] of [['desktop', 1280, 900], ['tablet', 820, 1180]]) {
  const pg = await (await b.newContext({ viewport: { width: vw, height: vh } })).newPage();
  await pg.goto(BASE + '/', W); await pg.evaluate(() => { localStorage.clear(); localStorage.setItem('rally-analytics-consent', 'no'); });
  await pg.goto(BASE + '/?name=shots', W); await pg.waitForTimeout(700);
  await pg.screenshot({ path: `/tmp/shot-${name}-welcome.png` });
  await pg.goto(BASE + '/scout', W); await pg.waitForTimeout(700);
  await pg.screenshot({ path: `/tmp/shot-${name}-scout.png` });
  await pg.close();
}
await b.close();
console.log('done');
