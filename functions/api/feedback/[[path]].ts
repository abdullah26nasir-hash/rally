// Feedback board API. Device identity (X-Rally-Device header, SHA-256 hashed) until accounts land.
// Rate limits per device: 5 requests/day, 20 comments/day, 60 votes/hour.
type Env = { DB?: D1Database };
type Context = { request: Request; env: Env };
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
const clean = (s: unknown, max: number) => typeof s === 'string' ? s.trim().slice(0, max) : '';
async function hashDevice(req: Request) {
  const id = req.headers.get('X-Rally-Device') || '';
  if (!/^[0-9a-f]{64}$/.test(id)) return null;
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function scout(db: D1Database, device: string): Promise<number> {
  const found = await db.prepare('SELECT scout_number AS n FROM fb_scouts WHERE device_hash=?').bind(device).first<{ n: number }>();
  if (found) return found.n;
  await db.prepare('INSERT INTO fb_scouts (device_hash,scout_number,created_at) VALUES (?,(SELECT COALESCE(MAX(scout_number),0)+1 FROM fb_scouts),?)').bind(device, new Date().toISOString()).run();
  const made = await db.prepare('SELECT scout_number AS n FROM fb_scouts WHERE device_hash=?').bind(device).first<{ n: number }>();
  return made?.n ?? 0;
}
async function limited(db: D1Database, table: string, col: string, device: string, window: string, max: number, extra = '') {
  const row = await db.prepare(`SELECT COUNT(*) AS n, MIN(created_at) AS first FROM ${table} WHERE device_hash=? AND created_at >= datetime('now','${window}')${extra}`).bind(device).first<{ n: number; first: string }>();
  if ((row?.n ?? 0) < max) return null;
  const retry = new Date(new Date(row!.first + 'Z').getTime() - 0);
  retry.setTime(retry.getTime() + (window.includes('hour') ? 3600e3 : 86400e3));
  const hh = String(retry.getUTCHours()).padStart(2, '0'); const mm = String(retry.getUTCMinutes()).padStart(2, '0');
  return json({ error: `Limit reached. Try again at ${hh}:${mm}.` }, 429);
}
const daysSince = (iso: string) => Math.max(0, (Date.now() - new Date(iso.endsWith('Z') ? iso : iso + 'Z').getTime()) / 86400e3);
const topScore = (votes: number, iso: string) => (votes + 1) / Math.sqrt(daysSince(iso) + 7);
const byTop = (a: { votes: number; createdAt: string; id: number }, b: { votes: number; createdAt: string; id: number }) =>
  topScore(b.votes, b.createdAt) - topScore(a.votes, a.createdAt) || b.createdAt.localeCompare(a.createdAt) || a.id - b.id;
const VISIBLE = "status IN ('open','under_review','planned')";
async function run({ request, env }: Context): Promise<Response> {
  const db = env.DB;
  if (!db) return json({ error: 'The feedback board is not ready here yet.' }, 503);
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // api feedback [...]
  if (parts[0] !== 'api' || parts[1] !== 'feedback') return json({ error: 'Not found.' }, 404);
  const method = request.method;
  if (method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: 'Origin not allowed.' }, 403);
  const device = await hashDevice(request);

  // Landing slice: public, read-only, triaged rows only. No device needed.
  if (parts.length === 3 && parts[2] === 'landing' && method === 'GET') {
    const { results } = await db.prepare(
      `SELECT r.id, r.title, r.status, r.created_at AS createdAt,
        (SELECT COUNT(*) FROM fb_votes v WHERE v.request_id=r.id) AS votes
       FROM fb_requests r
       WHERE r.hidden=0 AND r.status IN ('under_review','planned','shipped')
         AND NOT EXISTS (SELECT 1 FROM fb_comments c JOIN fb_reports rp ON rp.comment_id=c.id WHERE c.request_id=r.id GROUP BY c.id HAVING COUNT(*)>=3)
         AND (r.status!='shipped' OR r.created_at >= datetime('now','-60 days'))
       ORDER BY r.created_at DESC LIMIT 30`).all();
    (results as { status: string; votes: number; createdAt: string; id: number }[]).sort((a, b) =>
      (a.status === 'shipped' ? 1 : 0) - (b.status === 'shipped' ? 1 : 0) || byTop(a, b));
    results.length = Math.min(results.length, 3);
    const open = await db.prepare(`SELECT COUNT(*) AS n FROM fb_requests WHERE hidden=0 AND ${VISIBLE}`).first<{ n: number }>();
    const totalVotes = await db.prepare('SELECT COUNT(*) AS n FROM fb_votes').first<{ n: number }>();
    return json({ rows: results, openCount: open?.n ?? 0, totalVotes: totalVotes?.n ?? 0 });
  }
  if (!device) return json({ error: 'This browser cannot save a device identity.' }, 400);
  const me = await scout(db, device);

  if (parts.length === 3 && parts[2] === 'scout' && method === 'GET') return json({ scout: me });

  // Board list
  if (parts.length === 3 && parts[2] === 'board' && method === 'GET') {
    const filter = url.searchParams.get('filter') || 'all';
    const sort = url.searchParams.get('sort') === 'new' ? 'new' : 'top';
    let where = 'r.hidden=0';
    if (filter === 'under_review' || filter === 'planned') where += ` AND r.status='${filter}'`;
    else if (filter === 'shipped') where += " AND r.status='shipped'";
    else where += ` AND ${VISIBLE.replace(/status/g, 'r.status')}`;
    const order = 'r.created_at DESC, r.id DESC';
    const { results } = await db.prepare(
      `SELECT r.id, r.title, r.status, r.created_at AS createdAt, r.device_hash AS author,
        (SELECT scout_number FROM fb_scouts s WHERE s.device_hash=r.device_hash) AS scout,
        (SELECT COUNT(*) FROM fb_votes v WHERE v.request_id=r.id) AS votes,
        (SELECT COUNT(*) FROM fb_comments c WHERE c.request_id=r.id AND c.hidden=0) AS comments,
        EXISTS(SELECT 1 FROM fb_votes v WHERE v.request_id=r.id AND v.device_hash=?) AS voted
       FROM fb_requests r WHERE ${where} ORDER BY ${order} LIMIT 100`).bind(device).all();
    results.forEach((r) => { delete (r as Record<string, unknown>).author; });
    if (sort === 'top') (results as { votes: number; createdAt: string; id: number }[]).sort(byTop);
    const open = await db.prepare(`SELECT COUNT(*) AS n FROM fb_requests WHERE hidden=0 AND ${VISIBLE}`).first<{ n: number }>();
    return json({ rows: results, openCount: open?.n ?? 0, scout: me });
  }

  // Similar open requests (duplicate prevention while typing)
  if (parts.length === 3 && parts[2] === 'similar' && method === 'GET') {
    const q = clean(url.searchParams.get('q'), 80);
    if (q.length < 8) return json({ rows: [] });
    const words = [...new Set(q.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w) => w.length > 3))].slice(0, 4);
    if (!words.length) return json({ rows: [] });
    const like = words.map(() => "lower(r.title) LIKE ?").join(' OR ');
    const { results } = await db.prepare(
      `SELECT r.id, r.title, (SELECT COUNT(*) FROM fb_votes v WHERE v.request_id=r.id) AS votes,
        EXISTS(SELECT 1 FROM fb_votes v WHERE v.request_id=r.id AND v.device_hash=?) AS voted
       FROM fb_requests r WHERE r.hidden=0 AND ${VISIBLE.replace(/status/g, 'r.status')} AND (${like})
       ORDER BY votes DESC LIMIT 3`).bind(device, ...words.map((w) => `%${w}%`)).all();
    return json({ rows: results });
  }

  // New request
  if (parts.length === 3 && parts[2] === 'requests' && method === 'POST') {
    const gate = await limited(db, 'fb_requests', 'device_hash', device, '-1 day', 5);
    if (gate) return gate;
    let input: Record<string, unknown> | null = null;
    try { const t = await request.text(); if (t.length < 4096) input = JSON.parse(t); } catch { /* invalid */ }
    const title = clean(input?.title, 80); const details = clean(input?.details, 1000);
    if (!title || title.length < 8) return json({ error: 'Title needs at least 8 characters.' }, 400);
    const now = new Date().toISOString();
    const row = await db.prepare('INSERT INTO fb_requests (device_hash,title,details,created_at) VALUES (?,?,?,?) RETURNING id').bind(device, title, details, now).first<{ id: number }>();
    await db.prepare('INSERT OR IGNORE INTO fb_votes (request_id,device_hash,created_at) VALUES (?,?,?)').bind(row!.id, device, now).run();
    return json({ id: row!.id, title, votes: 1, voted: true, scout: me, createdAt: now, status: 'open' }, 201);
  }

  const id = parts[2] === 'requests' ? Number(parts[3]) : NaN;
  if (!Number.isInteger(id) || id < 1) return json({ error: 'Not found.' }, 404);

  // One request + comments
  if (parts.length === 4 && method === 'GET') {
    const r = await db.prepare(
      `SELECT r.id, r.title, r.details, r.status, r.team_update AS teamUpdate, r.team_update_at AS teamUpdateAt,
        r.created_at AS createdAt, r.hidden, r.device_hash AS author,
        (SELECT scout_number FROM fb_scouts s WHERE s.device_hash=r.device_hash) AS scout,
        (SELECT COUNT(*) FROM fb_votes v WHERE v.request_id=r.id) AS votes,
        EXISTS(SELECT 1 FROM fb_votes v WHERE v.request_id=r.id AND v.device_hash=?) AS voted
       FROM fb_requests r WHERE r.id=?`).bind(device, id).first();
    if (!r || (r.hidden && r.author !== device)) return json({ error: 'This request was removed.', removed: true }, 404);
    const { results: comments } = await db.prepare(
      `SELECT c.id, c.body, c.is_team AS isTeam, c.created_at AS createdAt, c.hidden, c.device_hash AS author,
        (SELECT scout_number FROM fb_scouts s WHERE s.device_hash=c.device_hash) AS scout,
        (SELECT COUNT(*) FROM fb_reports rp WHERE rp.comment_id=c.id) AS reports,
        EXISTS(SELECT 1 FROM fb_reports rp WHERE rp.comment_id=c.id AND rp.device_hash=?) AS reportedByYou
       FROM fb_comments c WHERE c.request_id=? ORDER BY c.created_at ASC, c.id ASC LIMIT 200`).bind(device, id).all();
    const shaped = comments.map((c) => {
      const mine = c.author === device; const hiddenAll = (c.hidden || (c.reports as number) >= 3) && !mine;
      return { id: c.id, isTeam: !!c.isTeam, createdAt: c.createdAt, scout: c.scout, mine,
        reportedByYou: !!c.reportedByYou, underReview: (c.hidden || (c.reports as number) >= 3) && mine,
        body: hiddenAll ? null : (c.reportedByYou && !mine ? null : c.body) };
    });
    return json({ request: { ...r, author: undefined, hidden: undefined, mine: r.author === device }, comments: shaped, scout: me });
  }

  // Vote toggle
  if (parts.length === 5 && parts[4] === 'vote' && method === 'POST') {
    const target = await db.prepare('SELECT id FROM fb_requests WHERE id=? AND hidden=0').bind(id).first();
    if (!target) return json({ error: 'That request is not available.' }, 404);
    const existing = await db.prepare('SELECT 1 FROM fb_votes WHERE request_id=? AND device_hash=?').bind(id, device).first();
    if (!existing) {
      const gate = await limited(db, 'fb_votes', 'device_hash', device, '-1 hour', 60);
      if (gate) return gate;
      await db.prepare('INSERT INTO fb_votes (request_id,device_hash,created_at) VALUES (?,?,?)').bind(id, device, new Date().toISOString()).run();
    } else {
      await db.prepare('DELETE FROM fb_votes WHERE request_id=? AND device_hash=?').bind(id, device).run();
    }
    const votes = await db.prepare('SELECT COUNT(*) AS n FROM fb_votes WHERE request_id=?').bind(id).first<{ n: number }>();
    return json({ voted: !existing, votes: votes?.n ?? 0 });
  }

  // New comment
  if (parts.length === 5 && parts[4] === 'comments' && method === 'POST') {
    const gate = await limited(db, 'fb_comments', 'device_hash', device, '-1 day', 20);
    if (gate) return gate;
    const target = await db.prepare('SELECT id FROM fb_requests WHERE id=? AND hidden=0').bind(id).first();
    if (!target) return json({ error: 'That request is not available.' }, 404);
    let input: Record<string, unknown> | null = null;
    try { const t = await request.text(); if (t.length < 2048) input = JSON.parse(t); } catch { /* invalid */ }
    const text = clean(input?.body, 500);
    if (!text) return json({ error: 'Write something first.' }, 400);
    const now = new Date().toISOString();
    const row = await db.prepare('INSERT INTO fb_comments (request_id,device_hash,body,created_at) VALUES (?,?,?,?) RETURNING id').bind(id, device, text, now).first<{ id: number }>();
    return json({ id: row!.id, body: text, createdAt: now, scout: me, mine: true, isTeam: false }, 201);
  }

  // Delete own comment / report a comment
  if (parts[2] === 'comments' && Number.isInteger(Number(parts[3]))) {
    const cid = Number(parts[3]);
    if (parts.length === 4 && method === 'DELETE') {
      const r = await db.prepare('DELETE FROM fb_comments WHERE id=? AND device_hash=? AND is_team=0').bind(cid, device).run();
      if (!r.meta.changes) return json({ error: 'You can only delete your own comments.' }, 403);
      return json({ ok: true });
    }
    if (parts.length === 5 && parts[4] === 'report' && method === 'POST') {
      const c = await db.prepare('SELECT device_hash FROM fb_comments WHERE id=?').bind(cid).first();
      if (!c) return json({ error: 'Not found.' }, 404);
      if (c.device_hash === device) return json({ error: 'You cannot report your own comment.' }, 400);
      await db.prepare('INSERT OR IGNORE INTO fb_reports (comment_id,device_hash,created_at) VALUES (?,?,?)').bind(cid, device, new Date().toISOString()).run();
      return json({ ok: true });
    }
  }
  return json({ error: 'Not found.' }, 404);
}
export async function onRequest(context: Context) {
  try { return await run(context); } catch (e) { console.error('Rally feedback API error', e instanceof Error ? e.message : 'error'); return json({ error: 'The feedback service is unavailable. Try again later.' }, 503); }
}
