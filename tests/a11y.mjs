// WCAG 2.1 AA (axe) + 44px targets + no sideways scroll, on every screen and state, phone and desktop.
import { launch, BASE, W, sample, axe, smallTargets, tally } from './lib.mjs';
const b = await launch(); const t = tally('a11y');
const states = [
  ['welcome', async (p) => { await p.goto(BASE + '/', W); await p.evaluate(() => localStorage.clear()); await p.reload(W); await p.waitForTimeout(1600); }],
  ['start 1', async (p) => { await p.goto(BASE + '/start', W); }],
  ['start 2', async (p) => { await p.goto(BASE + '/start', W); await p.getByLabel('Scout name').fill('Sam'); await p.getByRole('button', { name: 'Continue' }).click(); }],
  ['start 3', async (p) => { await p.goto(BASE + '/start', W); await p.getByLabel('Scout name').fill('Sam'); await p.getByRole('button', { name: 'Continue' }).click(); await p.getByRole('button', { name: 'Got it' }).click(); }],
  ['empty home', async (p) => { await p.goto(BASE + '/start', W); await p.getByLabel('Scout name').fill('Sam'); await p.getByRole('button', { name: 'Continue' }).click(); await p.getByRole('button', { name: 'Got it' }).click(); await p.getByRole('button', { name: 'Make my first call' }).click(); await p.goto(BASE + '/', W); }],
  ['first scout', async (p) => { await p.goto(BASE + '/scout?first=1', W); }],
  ['empty list', async (p) => { await p.goto(BASE + '/list', W); }],
  ['home', async (p) => { await sample(p); }],
  ['scout', async (p) => { await p.goto(BASE + '/scout', W); }],
  ['scout search empty', async (p) => { await p.goto(BASE + '/scout', W); await p.getByPlaceholder('Search players or clubs').fill('zzzz'); }],
  ['list', async (p) => { await p.goto(BASE + '/list', W); }],
  ['player', async (p) => { await p.goto(BASE + '/scout', W); await p.locator('a[href^="/player/"]').first().click(); }],
  ['swap sheet', async (p) => { await p.goto(BASE + '/scout', W); await p.locator('a[href^="/player/"]').first().click(); await p.getByRole('button', { name: 'Swap him in' }).click(); await p.getByRole('dialog').waitFor(); await p.waitForTimeout(300); }],
  ['receipt new', async (p) => { await p.goto(BASE + '/list', W); await p.getByRole('button', { name: 'Receipt' }).first().click(); await p.waitForTimeout(1600); }],
  ['leagues', async (p) => { await p.goto(BASE + '/leagues', W); }],
  ['league join error', async (p) => { await p.goto(BASE + '/leagues', W); await p.getByLabel('League code').fill('ZZZZZZ'); await p.getByRole('button', { name: 'Join league' }).click(); }],
  ['league', async (p) => { await p.goto(BASE + '/leagues/lg-sunday', W); }],
  ['join', async (p) => { await p.goto(BASE + '/join/LADS26', W); }],
  ['how', async (p) => { await p.goto(BASE + '/how', W); }],
  ['not found', async (p) => { await p.goto(BASE + '/player/nope', W); }],
];
for (const [vw, vh, dev] of [[390, 844, 'phone'], [1280, 800, 'desktop'], [320, 640, 'small']]) {
  const p = await b.newPage({ viewport: { width: vw, height: vh } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  for (const [name, go] of states) {
    try { await go(p); } catch (e) { t.check(`${dev} ${name} setup`, false, e.message.split('\n')[0]); continue; }
    await p.waitForTimeout(250);
    if (dev !== 'small') { const v = await axe(p); t.check(`${dev} ${name} axe`, !v.length, v.join('; ')); }
    if (dev !== 'desktop') { const s = await smallTargets(p); t.check(`${dev} ${name} 44px`, !s.length, s.slice(0, 6).join(', ')); }
    const ovf = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); t.check(`${dev} ${name} no sideways scroll`, ovf <= 0, ovf + 'px');
  }
  t.check(`${dev} no page errors`, !errs.length, errs[0]);
  await p.close();
}
process.exitCode = t.done();
await b.close();
