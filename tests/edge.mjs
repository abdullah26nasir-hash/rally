// Edge cases from real play: bad saved data, double taps, swaps, two tabs, keyboard and screen-reader behaviour.
import { launch, BASE, W, sample, tally } from './lib.mjs';
const b = await launch(); const t = tally('edge cases');
const errs = [];
const page = async (opts = {}) => { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'], ...opts }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); return p; };
const text = (p) => p.locator('body').innerText();
const stored = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('rally-v1') || '{}').state || {});
const seasonTotal = async (p) => { await p.goto(BASE + '/', W); await p.waitForTimeout(200); return Number((await text(p)).match(/Season total\s*(\d+)/)?.[1]); };

let p = await page();
// Saved data
await p.goto(BASE + '/', W); await p.evaluate(() => localStorage.setItem('rally-v1', '{not json')); await p.reload(W); await p.waitForTimeout(300);
t.check('corrupt save: app still opens', /Call them/.test(await text(p)));
await p.evaluate(() => localStorage.setItem('rally-v1', JSON.stringify({ version: 2, state: { mode: 'own', name: 42, picks: [{ playerId: 'nobody' }, null], leagues: 'x', swaps: null } }))); await p.reload(W); await p.waitForTimeout(300);
t.check('junk save: unknown players dropped, no crash', /Start your list/.test(await text(p)));
await sample(p); const v1 = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('rally-v1')); delete s.state.history; s.version = 0; return JSON.stringify(s); });
await p.evaluate((s) => localStorage.setItem('rally-v1', s), v1); await p.reload(W); await p.waitForTimeout(300);
t.check('older save version keeps your list', (await stored(p)).picks?.length === 5);

// Swaps keep what you earned
await sample(p); const before = await seasonTotal(p); const stampsBefore = (await text(p)).match(/Stamp book · (\d+)/)?.[1];
const outName = await p.evaluate(() => JSON.parse(localStorage.getItem('rally-v1')).state.picks[0].playerId);
await p.goto(BASE + '/scout', W); await p.locator('a[href^="/player/"]').first().click(); await p.getByRole('button', { name: 'Swap him in' }).click();
const d = p.getByRole('dialog'); await d.waitFor(); t.check('swap sheet takes focus', await p.evaluate(() => !!document.activeElement?.closest('[role=dialog]')));
await p.keyboard.press('Escape'); await p.waitForTimeout(300); t.check('Escape closes sheet, focus returns', await p.evaluate(() => /Swap him in/.test(document.activeElement?.textContent || '')));
await p.getByRole('button', { name: 'Swap him in' }).click(); await d.waitFor();
const outBtn = d.locator('button:not([disabled])').filter({ hasText: 'Swap out' }).first(); const swappedOut = (await outBtn.innerText()).split('\n')[0];
await outBtn.dblclick(); await p.waitForTimeout(400);
const s1 = await stored(p); t.check('double-tap swap uses one swap', s1.swaps?.[7] === 1 && s1.picks.length === 5, JSON.stringify(s1.swaps));
const after = await seasonTotal(p); t.check('swap keeps season points', after === before, `${before} → ${after}`);
t.check('swap keeps stamps', Number((await text(p)).match(/Stamp book · (\d+)/)?.[1]) >= Number(stampsBefore), `${stampsBefore} → ${(await text(p)).match(/Stamp book · (\d+)/)?.[1]}`);
const oldId = s1.history?.[0]?.playerId; await p.goto(BASE + '/receipt/' + oldId, W); await p.waitForTimeout(300);
t.check('swapped-out player keeps receipt', !/No receipt/.test(await text(p)), swappedOut);
await p.goto(BASE + '/', W); await p.getByRole('button', { name: 'Previous gameweek' }).click(); t.check('past slip still shows swapped-out player', (await text(p)).includes(swappedOut.split(' ').pop()));
await p.goBack(); await p.goBack(); await p.waitForTimeout(300); t.check('back button after swap does not swap again', (await stored(p)).swaps?.[7] === 1);

// Double tap scout, club rule
await p.goto(BASE + '/start', W); await p.getByLabel('Scout name').fill('Sam'); await p.getByRole('button', { name: 'Continue' }).click(); await p.getByRole('button', { name: 'Got it' }).click(); await p.getByRole('button', { name: 'Make my first call' }).click();
await p.locator('a[href^="/player/"]').first().click(); await p.getByRole('button', { name: 'Scout him' }).dblclick(); await p.waitForTimeout(300);
t.check('double-tap scout adds one player', (await stored(p)).picks.length === 1);
t.check('name with spaces only is rejected', await (async () => { await p.goto(BASE + '/start', W); await p.getByLabel('Scout name').fill('   '); return p.getByRole('button', { name: 'Continue' }).isDisabled(); })());

// Leagues
await sample(p); await p.goto(BASE + '/leagues', W);
await p.getByLabel('League name').fill('   '); t.check('blank league name blocked', await p.getByRole('button', { name: 'Create league' }).isDisabled());
await p.getByLabel('League name').fill('x'.repeat(80)); t.check('league name capped at 40', (await p.getByLabel('League name').inputValue()).length === 40);
await p.getByLabel('League name').fill('Tuesday 5s ⚽'); await p.getByRole('button', { name: 'Create league' }).click(); await p.waitForTimeout(300);
t.check('without D1: create fails honestly', await (async () => {await p.getByRole('alert').waitFor({timeout:5000}).catch(()=>{}); return !!(await p.getByRole('alert').count()) && p.url().endsWith('/leagues')})());
await p.goto(BASE + '/leagues/lg-sunday', W); await p.getByRole('button', { name: /Copy invite link/ }).click(); await p.waitForTimeout(200);
t.check('copy invite announced to screen readers', (await p.locator('[role=status]').allInnerTexts()).some((x) => /copied/i.test(x)));
await p.getByLabel('League code').fill('lads26').catch(() => {}); // not on detail page
await p.goto(BASE + '/leagues', W); await p.getByLabel('League code').fill('lads26'); t.check('league code is uppercased', (await p.getByLabel('League code').inputValue()) === 'LADS26');

// Keyboard and screen reader
await p.goto(BASE + '/', W); await p.waitForTimeout(300); await p.goto(BASE + '/', W); await p.waitForTimeout(100); await p.evaluate(() => { const x = document.querySelector('a[href="#main"]'); x?.focus(); }); t.check('skip link can take focus', await p.evaluate(() => document.activeElement?.textContent === 'Skip to content'));
await p.getByRole('link', { name: 'Scout' }).last().click(); await p.waitForTimeout(300);
t.check('page change moves focus to heading', await p.evaluate(() => document.activeElement?.tagName === 'H1'));
t.check('page change updates title', (await p.title()).startsWith('Scout'), await p.title());
await p.goto(BASE + '/', W); const prev = p.getByRole('button', { name: 'Previous gameweek' }); for (let i = 0; i < 8; i++) await prev.press('Enter');
t.check('pager keeps focus at first week', await p.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Previous gameweek') && /Gameweek 1/.test(await text(p)));

// Start over
await p.goto(BASE + '/how', W); await p.getByRole('button', { name: 'Start my own list' }).click(); await p.waitForTimeout(200);
t.check('sample → own season', p.url().endsWith('/start') && (await stored(p)).mode === 'new');
await p.close();

// Two tabs stay in step
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const a = await ctx.newPage(); const c = await ctx.newPage();
await sample(a); await c.goto(BASE + '/leagues', W); await a.goto(BASE + '/leagues', W); await a.getByLabel('League code').fill('LADS26'); await a.getByRole('button', { name: 'Join league' }).click(); await a.waitForTimeout(500);
await c.getByRole('link', { name: 'Leagues' }).last().click(); await c.waitForTimeout(300); t.check('second tab sees new league', /Sunday League Lads/.test(await c.locator('body').innerText()));
await ctx.close();

// Storage blocked (private mode / strict settings)
p = await page(); await p.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('blocked', 'QuotaExceededError'); }; });
await p.goto(BASE + '/', W); await p.getByRole('button', { name: 'Try a sample season' }).click(); await p.waitForTimeout(300);
t.check('storage blocked: still playable', /Gameweek 6/.test(await text(p)));
await p.close();

// Reduced motion
p = await page({ reducedMotion: 'reduce' }); await sample(p); await p.goto(BASE + '/list', W); await p.getByRole('button', { name: 'Receipt' }).first().click();
const durs = await p.evaluate(() => [...document.querySelectorAll('*')].map((e) => getComputedStyle(e)).filter((s) => s.animationName !== 'none').map((s) => parseFloat(s.animationDuration) * 1000));
t.check('reduced motion: animations short and simple', durs.every((x) => x <= 200), durs.join(','));
await p.close();

t.check('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
process.exitCode = t.done(); await b.close();
