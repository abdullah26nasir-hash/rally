import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const out = '/downloads/showcase';
for (const [tag, vp, mob] of [['mobile', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage();
  const base = 'http://localhost:4173';
  await p.goto(base); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/1-welcome-${tag}.png` });
  await p.getByRole('button', { name: 'Try a sample season' }).click(); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/2-this-week-${tag}.png` });
  await p.goto(base + '/scout'); await p.waitForTimeout(500); await p.screenshot({ path: `${out}/3-scout-${tag}.png` });
  const first = await p.locator('main ul li a').first().getAttribute('href');
  await p.goto(base + first); await p.waitForTimeout(500); await p.screenshot({ path: `${out}/4-player-${tag}.png` });
  const ids = await p.evaluate(() => JSON.parse(localStorage.getItem('rally-v1')).state.picks.map((x) => x.playerId));
  await p.goto(base + '/receipt/' + ids[3] + '?new=1'); await p.waitForTimeout(1400); await p.screenshot({ path: `${out}/5-receipt-${tag}.png` });
  await p.goto(base + '/leagues/lg-sunday'); await p.waitForTimeout(500); await p.screenshot({ path: `${out}/6-league-${tag}.png` });
  await ctx.close();
}
await b.close(); console.log('done');
