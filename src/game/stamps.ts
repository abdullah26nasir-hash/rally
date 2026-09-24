import type { Pick, Player } from '../data/types';
import { playerById, ownershipNow } from '../data/pool';
import { LAST_COMPLETE_GW, GW1_DATE } from '../data/season';

export type StampKind = 'first-call' | 'under-radar' | 'called-it' | 'debut' | 'call-up' | 'big-week';

export const STAMP_INFO: Record<StampKind, { title: string; rule: string; xp: number }> = {
  'first-call': { title: 'First call', rule: 'Scout your first player', xp: 10 },
  'under-radar': { title: 'Under the radar', rule: 'Scout someone fewer than 1% of scouts have', xp: 20 },
  'called-it': { title: 'Called it', rule: '10× more scouts pick him after you did', xp: 50 },
  debut: { title: 'Saw the debut', rule: 'Your pick makes his senior debut', xp: 25 },
  'call-up': { title: 'Call-up', rule: 'Your pick gets his first international call-up', xp: 25 },
  'big-week': { title: 'Big week', rule: 'Your pick scores 10+ points in a gameweek', xp: 15 },
};

export interface Stamp { id: string; kind: StampKind; player: Player; earnedAt: string; gw: number; }

const gwDate = (gw: number) => new Date(GW1_DATE.getTime() + (gw - 1) * 7 * 864e5 + 6 * 3600e3).toISOString();

export function stampsFor(picks: Pick[]): Stamp[] {
  const out: Stamp[] = [];
  const sorted = [...picks].sort((a, b) => a.scoutedAt.localeCompare(b.scoutedAt));
  sorted.forEach((pk, i) => {
    const p = playerById.get(pk.playerId)!;
    const push = (kind: StampKind, earnedAt: string, gw: number) => out.push({ id: `${kind}-${p.id}`, kind, player: p, earnedAt, gw });
    if (i === 0) push('first-call', pk.scoutedAt, pk.gwFrom);
    if (pk.ownershipAtPick < 1) push('under-radar', pk.scoutedAt, pk.gwFrom);
    if (pk.gwFrom <= LAST_COMPLETE_GW && ownershipNow(p) / Math.max(pk.ownershipAtPick, 0.1) >= 10) push('called-it', gwDate(LAST_COMPLETE_GW), LAST_COMPLETE_GW);
    for (const w of p.weeks) {
      if (w.gw < pk.gwFrom || w.gw > LAST_COMPLETE_GW) continue;
      if (w.moment === 'Senior debut') push('debut', gwDate(w.gw), w.gw);
      if (w.moment === 'First call-up') push('call-up', gwDate(w.gw), w.gw);
    }
    const big = p.weeks.find((w) => w.gw >= pk.gwFrom && w.gw <= LAST_COMPLETE_GW && w.points >= 10);
    if (big) push('big-week', gwDate(big.gw), big.gw);
  });
  return out.sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
}

export const LEVELS = [
  { name: 'Sunday watcher', xp: 0 },
  { name: 'Touchline regular', xp: 40 },
  { name: 'Area scout', xp: 100 },
  { name: 'Regional scout', xp: 200 },
  { name: 'Chief scout', xp: 350 },
  { name: 'Head of recruitment', xp: 550 },
];

export function levelFor(stamps: Stamp[]) {
  const xp = stamps.reduce((a, s) => a + STAMP_INFO[s.kind].xp, 0);
  let idx = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.xp) idx = i; });
  const next = LEVELS[idx + 1];
  return { xp, level: idx + 1, name: LEVELS[idx].name, next, toNext: next ? next.xp - xp : 0, progress: next ? (xp - LEVELS[idx].xp) / (next.xp - LEVELS[idx].xp) : 1 };
}
