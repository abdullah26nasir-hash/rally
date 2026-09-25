import { launch, BASE, W, sample } from './lib.mjs';
const b = await launch();
const jobs = [
  ['m-home', 390, 844, '/'], ['m-scout', 390, 844, '/scout'],
  ['m-how', 390, 844, '/how'], ['m-player', 390, 844, '/player/p003'],
  ['d-home', 1280, 900, '/'], ['m-receipt', 390, 844, '/receipt/p005']
];
for (const [tag, w, h, path] of jobs) {
  const pg = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await sample(pg); await pg.goto(BASE + path, W); await pg.waitForTimeout(700);
  await pg.screenshot({ path: `/tmp/v64-${tag}.png` }); await pg.close();
}
console.log('done'); await b.close();
