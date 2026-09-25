import { launch, BASE, W, sample, axe, smallTargets } from './lib.mjs';
const b = await launch();
const out = [];
async function snap(pg, tag) {
  const small = await smallTargets(pg);
  const ax = await axe(pg);
  const overflow = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await pg.screenshot({ path: `/tmp/bigaudit/320-${tag}.png` });
  if (small.length || ax.length || overflow > 1) out.push(`320-${tag}: small=${JSON.stringify(small.slice(0,8))} axe=${JSON.stringify(ax.slice(0,4))} overflow=${overflow}`);
}
const ctx = await b.newContext({ viewport: { width: 320, height: 700 } });
const pg = await ctx.newPage();
await sample(pg);
await pg.goto(BASE + '/player/p003', W); await pg.waitForTimeout(700); await snap(pg, 'player');
// swap sheet: go to list, open swap
await pg.goto(BASE + '/list', W); await pg.waitForTimeout(700); await snap(pg, 'list');
const swapBtn = pg.getByRole('button', { name: /swap/i }).first();
if (await swapBtn.isVisible().catch(()=>false)) { await swapBtn.click(); await pg.waitForTimeout(600); await snap(pg, 'swapsheet'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); }
// scout with player panel
await pg.goto(BASE + '/scout', W); await pg.waitForTimeout(700); await snap(pg, 'scout');
const rowBtn = pg.getByRole('button', { name: /njie|rowe|delacroix/i }).first();
if (await rowBtn.isVisible().catch(()=>false)) { await rowBtn.click(); await pg.waitForTimeout(600); await snap(pg, 'scout-panel'); await pg.keyboard.press('Escape'); }
// leagues share sheet
await pg.goto(BASE + '/leagues', W); await pg.waitForTimeout(700); await snap(pg, 'leagues');
// home 320
await pg.goto(BASE + '/', W); await pg.waitForTimeout(700); await snap(pg, 'home');
// welcome 320
await pg.evaluate(() => localStorage.clear());
await pg.goto(BASE + '/', W); await pg.waitForTimeout(700); await snap(pg, 'welcome');
console.log(out.length ? out.join('\n') : '320 CLEAN');
await b.close();
