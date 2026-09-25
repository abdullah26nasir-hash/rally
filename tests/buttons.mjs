// Clicks every visible control on every screen, one at a time from the same saved state,
// and checks something visible happened (new page, new text, a download or a share) with no errors.
import { launch, BASE, W, sample, tally } from './lib.mjs';
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/scout', '/list', '/leagues', '/leagues/lg-sunday', '/how', '/player/p003', '/receipt/p005', '/join/LADS26', '/start'];
const b = await launch(); const t = tally(`buttons ${routes.join(' ')}`);
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
await ctx.addInitScript(() => { navigator.canShare = () => true; navigator.share = async () => { window.__shared = 1; }; });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
await sample(p); const snap = await p.evaluate(() => localStorage.getItem('rally-v1'));
const sel = 'button:visible:not(:has-text("Analytics settings")), a:visible:not([href="#main"]), [role=switch]:visible'; // skip link is covered in edge.mjs
const open = async (r) => { await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('rally-v1', s); localStorage.setItem('rally-analytics-consent', 'no'); }, snap); await p.goto(BASE + r, W); await p.waitForTimeout(r.startsWith('/receipt') ? 1500 : 250); };
const state = () => p.evaluate(() => [location.href, document.body.innerText, window.__shared || 0, document.querySelectorAll('[aria-checked=true],[aria-expanded=true],[role=dialog]').length, scrollY, document.activeElement?.id].join('|'));
for (const r of routes) {
  await open(r);
  const names = await p.locator(sel).evaluateAll((els) => els.map((e) => (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)));
  const limit = r === '/scout' ? 30 : names.length; // Scout repeats the same player row 126 times
  for (let i = 0; i < limit; i++) {
    await open(r); const el = p.locator(sel).nth(i);
    if (await el.isDisabled().catch(() => false)) { t.check(`${r} "${names[i]}" (disabled until filled in)`, true); continue; }
    const current = (await el.getAttribute('aria-current')) === 'page' || (await el.getAttribute('aria-pressed')) === 'true' || (await el.getAttribute('aria-selected')) === 'true'; // already active
    const before = await state(); const e0 = errs.length; let dl = false; p.once('download', () => (dl = true));
    const ok = await el.click({ timeout: 2500 }).then(() => true, () => false); await p.waitForTimeout(350);
    const changed = dl || current || before !== (await state());
    t.check(`${r} "${names[i]}"`, ok && changed && errs.length === e0, !ok ? 'click failed' : errs.length > e0 ? errs.at(-1) : 'nothing happened');
  }
}
process.exitCode = t.done(); await b.close();
