// Security checks: headers, what the build ships, and hostile input through every text entry point.
import fs from 'fs';
import { launch, BASE, W, sample, tally } from './lib.mjs';
const t = tally('security');
const live = BASE.startsWith('https');
// 1. Headers (live response when testing a deploy, the _headers file otherwise)
const want = { 'content-security-policy': /script-src 'self'(?![^;]*unsafe)/, 'x-frame-options': /DENY/, 'x-content-type-options': /nosniff/, 'referrer-policy': /no-referrer/, 'x-robots-tag': /noindex/, 'permissions-policy': /camera=\(\)/, 'cross-origin-opener-policy': /same-origin/ };
const headers = live ? Object.fromEntries((await fetch(BASE)).headers) : Object.fromEntries(fs.readFileSync('public/_headers', 'utf8').split('\n').filter((l) => l.includes(':') && l.startsWith('  ')).map((l) => [l.trim().split(':')[0].toLowerCase(), l.split(/:(.*)/)[1].trim()]));
for (const [h, re] of Object.entries(want)) t.check(`header ${h}`, re.test(headers[h] || ''), headers[h] || 'missing');
// 2. What ships
const files = fs.readdirSync('dist/assets'); const js = files.filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync('dist/assets/' + f, 'utf8')).join('\n');
t.check('no secrets or keys in bundle', !/(sk_(live|test)_|pk_live_|AKIA[0-9A-Z]{16}|-----BEGIN|ghp_[A-Za-z0-9]{20}|xox[bp]-)/.test(js));
t.check('no source maps shipped', !files.some((f) => f.endsWith('.map')));
t.check('no env files in build', !fs.readdirSync('dist').some((f) => f.startsWith('.env')));
t.check('robots.txt disallows all', /Disallow: \//.test(fs.readFileSync('dist/robots.txt', 'utf8')));
const src = fs.readdirSync('src', { recursive: true }).filter((f) => /\.tsx?$/.test(f)).map((f) => fs.readFileSync('src/' + f, 'utf8')).join('\n');
t.check('no raw HTML, eval or URL-driven redirects in source', !/dangerouslySetInnerHTML|\.innerHTML\s*=|eval\(|new Function|location\.(href|assign|replace)\s*[=(]/.test(src));
// 3. Hostile input
const b = await launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
let fired = 0; p.on('dialog', (d) => { fired++; d.dismiss(); });
await p.exposeFunction('__pwned', () => fired++);
const payload = `"><img src=x onerror=__pwned()><svg onload=__pwned()>`;
await p.goto(BASE + '/join/' + encodeURIComponent(payload), W); await p.waitForTimeout(400);
t.check('join link: payload not rendered', !(await p.locator('body').innerText()).includes('onerror') && /looks broken/.test(await p.locator('body').innerText()));
await p.goto(BASE + '/start', W); await p.getByLabel('Scout name').fill(payload); t.check('scout name strips markup characters', !/[<>"=]/.test(await p.getByLabel('Scout name').inputValue()));
await sample(p); await p.goto(BASE + '/leagues', W); await p.getByLabel('League name').fill(payload.slice(0, 40)); await p.getByRole('button', { name: 'Create league' }).click(); await p.waitForTimeout(300);
t.check('league name shown as plain text', (await p.locator('h1').innerText()).includes('<img'));
await p.goto(BASE + '/scout', W); await p.getByPlaceholder('Search players or clubs').fill(payload); await p.waitForTimeout(200);
await p.goto(BASE + '/', W); await p.evaluate((x) => { const s = JSON.parse(localStorage.getItem('rally-v1')); s.state.name = x; s.state.leagues.push({ id: x, name: x, code: 'AAAA', kind: 'private', members: [] }); localStorage.setItem('rally-v1', JSON.stringify(s)); }, payload); await p.reload(W); await p.goto(BASE + '/leagues', W); await p.waitForTimeout(300);
t.check('tampered save data shown as text', fired === 0);
t.check('no script ran from any payload', fired === 0, `${fired} fired`);
for (const path of ['//evil.example', '/%2F%2Fevil.example', '/join/..%2F..%2Fevil']) { await p.goto(BASE + path, W).catch(() => {}); await p.waitForTimeout(200); t.check(`no open redirect via ${path}`, new URL(p.url()).host === new URL(BASE).host, p.url()); }
if (live) for (const f of ['/.env', '/.git/config', '/package.json', '/src/main.tsx']) { const r = await fetch(BASE + f); t.check(`${f} not exposed`, !(await r.text()).match(/"dependencies"|\[core\]|import React|=\S+/) || r.headers.get('content-type')?.includes('text/html'), String(r.status)); }
process.exitCode = t.done(); await b.close();
