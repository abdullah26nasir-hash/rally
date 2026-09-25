// Pages Functions, deployed separately from dist. Codes are bearer invitations, not secret authentication.
// A per-browser random device secret identifies the member; no user accounts in this preview.
import { playerById, ownershipAt } from '../../src/data/pool';
import { LAST_COMPLETE_GW } from '../../src/data/season';
import { earlyCallFor, pickPointsForGw } from '../../src/game/scoring';
import type { Pick } from '../../src/data/types';

type Env = { DB?: D1Database };
type Context = { request: Request; env: Env };
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
const clean = (s: unknown, max: number) => typeof s === 'string' ? s.trim().slice(0, max) : '';
const codeOK = (s: string) => /^[A-Z2-9]{6}$/.test(s) && !/[01IO]/.test(s);
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() { const a = new Uint8Array(6); crypto.getRandomValues(a); return [...a].map((v) => ALPHABET[v % ALPHABET.length]).join(''); }
async function hashDevice(req: Request) {
  const id = req.headers.get('X-Rally-Device') || '';
  if (!/^[0-9a-f]{64}$/.test(id)) return null;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function score(body: Record<string, unknown>): { gw: number; total: number } | null {
  if (!Array.isArray(body.picks) || !Array.isArray(body.history) || body.picks.length > 5 || body.history.length > 100) return null;
  const picks = [...body.picks, ...body.history] as Pick[];
  if (picks.some((p) => !p || typeof p.playerId !== 'string' || !playerById.has(p.playerId) || !Number.isInteger(p.gwFrom) || p.gwFrom < 1 || p.gwFrom > LAST_COMPLETE_GW + 1 || (p.gwTo !== undefined && (!Number.isInteger(p.gwTo) || p.gwTo < 1 || p.gwTo > LAST_COMPLETE_GW)) || p.multiplier !== earlyCallFor(ownershipAt(playerById.get(p.playerId)!, p.gwFrom - 1)))) return null;
  if (new Set((body.picks as Pick[]).map((p) => p.playerId)).size !== body.picks.length) return null;
  // Preview scores come from the fixed fictional season, never client-supplied totals.
  const total = picks.reduce((a, p) => a + [...Array(LAST_COMPLETE_GW)].reduce((t, _, i) => t + pickPointsForGw(p, playerById.get(p.playerId)!, i + 1), 0), 0);
  const gw = picks.reduce((a, p) => a + pickPointsForGw(p, playerById.get(p.playerId)!, LAST_COMPLETE_GW), 0);
  return { gw, total };
}
async function body(req: Request): Promise<Record<string, unknown> | null> {
  if (Number(req.headers.get('content-length') || 0) > 8192) return null;
  try { const text = await req.text(); if (text.length > 8192) return null; const data = JSON.parse(text); return data && typeof data === 'object' && !Array.isArray(data) ? data : null; } catch { return null; }
}
async function run({ request, env }: Context): Promise<Response> {
  const db = env.DB;
  if (!db) return json({ error: 'Shared leagues are not ready here yet.' }, 503);
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api' || parts[1] !== 'leagues' || parts.length > 4) return json({ error: 'Not found.' }, 404);
  const method = request.method;
  if (method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: 'Origin not allowed.' }, 403);
  const device = await hashDevice(request);
  if (!device) return json({ error: 'This browser cannot save a league identity.' }, 400);
  const code = (parts[2] || '').toUpperCase();
  if (parts.length === 2 && method === 'POST') {
    const input = await body(request); const name = clean(input?.name, 40); const scout = clean(input?.scout, 20);
    if (!name || !scout || !input || !score(input)) return json({ error: 'Check the league name and scout list.' }, 400);
    const s = score(input)!;
    for (let i = 0; i < 5; i++) {
      const c = newCode(); const now = new Date().toISOString();
      try {
        await db.batch([
          db.prepare('INSERT INTO leagues (code,name,created_at) VALUES (?,?,?)').bind(c, name, now),
          db.prepare('INSERT INTO members (league_code,device_hash,name,gw,total,joined_at) VALUES (?,?,?,?,?,?)').bind(c,device,scout,s.gw,s.total,now),
        ]);
        return json({ code: c, name, createdAt: now }, 201);
      } catch (e) { if (!/UNIQUE|constraint/i.test(String(e))) throw e; }
    }
    return json({ error: 'Could not make a unique code. Try again.' }, 503);
  }
  if (!codeOK(code)) return json({ error: 'That league code is not valid.' }, 400);
  const league = await db.prepare('SELECT code,name,created_at AS createdAt FROM leagues WHERE code=?').bind(code).first();
  if (!league) return json({ error: 'No league with that code.' }, 404);
  if (parts.length === 4 && parts[3] === 'join' && method === 'POST') {
    const input = await body(request); const scout = clean(input?.scout, 20);
    if (!scout || !input || !score(input)) return json({ error: 'Check your scout name and list.' }, 400);
    const s = score(input)!;
    const size = await db.prepare('SELECT COUNT(*) AS n FROM members WHERE league_code=?').bind(code).first<{n:number}>();
    if ((size?.n ?? 0) >= 100 && !await db.prepare('SELECT 1 FROM members WHERE league_code=? AND device_hash=?').bind(code,device).first()) return json({ error: 'This league is full.' }, 403);
    await db.prepare('INSERT INTO members (league_code,device_hash,name,gw,total,joined_at) VALUES (?,?,?,?,?,?) ON CONFLICT(league_code,device_hash) DO UPDATE SET name=excluded.name,gw=excluded.gw,total=excluded.total').bind(code,device,scout,s.gw,s.total,new Date().toISOString()).run();
    return json({ league });
  }
  if (parts.length === 4 && parts[3] === 'standings' && method === 'GET') {
    const mine = await db.prepare('SELECT 1 FROM members WHERE league_code=? AND device_hash=?').bind(code,device).first();
    if (!mine) return json({ error: 'Join this league first.' }, 403);
    const { results } = await db.prepare('SELECT device_hash AS id,name,gw,total FROM members WHERE league_code=? ORDER BY total DESC,joined_at ASC LIMIT 100').bind(code).all();
    return json({ league, members: results.map((m) => ({ ...m, you: m.id === device, id: undefined })) });
  }
  if (parts.length === 4 && parts[3] === 'sync' && method === 'POST') {
    const input = await body(request); const s = input && score(input); const scout = clean(input?.scout, 20);
    if (!s || !scout) return json({ error: 'Check the list before syncing.' }, 400);
    const result = await db.prepare('UPDATE members SET name=?,gw=?,total=? WHERE league_code=? AND device_hash=?').bind(scout,s.gw,s.total,code,device).run();
    if (!result.meta.changes) return json({ error: 'Join this league first.' }, 403);
    return json({ ok: true });
  }
  return json({ error: 'Not found.' }, 404);
}
export async function onRequest(context: Context) {
  try { return await run(context); } catch (e) { console.error('Rally league API error', e instanceof Error ? e.name : 'error'); return json({ error: 'League service is unavailable. Try again later.' }, 503); }
}
