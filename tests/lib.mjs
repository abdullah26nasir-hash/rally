// Shared helpers for the Playwright test scripts. Run against `npm run preview` (port 4173) or BASE=<url>.
import { chromium } from 'playwright-core';
import fs from 'fs';
export const BASE = process.env.BASE || 'http://localhost:4173';
export const W = { waitUntil: 'domcontentloaded' };
export const launch = () => chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const axeSrc = fs.readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

export async function sample(p) {
  await p.goto(BASE + '/', W); await p.evaluate(() => localStorage.clear()); await p.reload(W);
  const reject = p.getByRole('button', { name: 'No thanks' }); if (await reject.isVisible().catch(() => false)) await reject.click();
  await p.getByRole('button', { name: 'Try a sample season' }).click(); await p.waitForTimeout(300);
}
export async function axe(p) {
  await p.evaluate(axeSrc);
  return p.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] })).violations
    .map((v) => `${v.id} x${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
}
// HIG: every tappable control at least 44x44 CSS px (inline text links inside a sentence are exempt, per WCAG 2.5.8).
export function smallTargets(p) {
  return p.evaluate(() => [...document.querySelectorAll('a[href],button,input,select,textarea,[role=switch],[role=tab],[tabindex="0"]')].filter((e) => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (!r.width || !r.height || cs.visibility === 'hidden') return false;
    if (e.matches('.sr-only:not(:focus)')) return false; // visually hidden skip link; sized when focused
    if (e.tagName === 'A' && cs.display === 'inline' && e.closest('p')) return false;
    if (e.matches('[tabindex="0"]:not(a,button)') && r.height > 60) return false; // scroll regions
    return r.width < 44 || r.height < 44;
  }).map((e) => `${e.tagName.toLowerCase()} "${(e.getAttribute('aria-label') || e.textContent || e.placeholder || '').trim().slice(0, 24)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
}
export function tally(name) {
  const r = { name, pass: 0, fail: [] };
  r.check = (label, ok, info = '') => { if (ok) r.pass++; else r.fail.push(`${label}${info ? ' - ' + info : ''}`); };
  r.done = () => { console.log(`${name}: ${r.pass}/${r.pass + r.fail.length} pass`); r.fail.forEach((f) => console.log('  FAIL ' + f)); return r.fail.length; };
  return r;
}
