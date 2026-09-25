import { launch, BASE, W, sample } from './lib.mjs';
const b = await launch();
const jobs = [
  ['m-home', 390, 844, '/'], ['m-leagues', 390, 844, '/leagues/lg-sunday'],
  ['m-scout', 390, 844, '/scout'], ['d-home', 1280, 900, '/']
];
for (const [tag, w, h, path] of jobs) {
  const pg = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await sample(pg); await pg.goto(BASE + path, W); await pg.waitForTimeout(700);
  await pg.screenshot({ path: `/downloads/prod65-${tag}.png` }); await pg.close();
}
console.log('done'); await b.close();
