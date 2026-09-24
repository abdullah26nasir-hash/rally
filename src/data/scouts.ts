import { mulberry32 } from '../lib/rng';
import { earlyCallFor, pickPointsTotal, pickPointsForGw } from '../game/scoring';
import { PLAYERS, playerById, ownershipAt } from './pool';
import { GW1_DATE, LAST_COMPLETE_GW, TOTAL_SCOUTS } from './season';
import type { Pick, Player, ScoutEntry } from './types';

// Preview-season rivals. All fictional.
const RIVALS: Array<[string, string]> = [
  ['Deji', 'dejiscouts'], ['Hannah', 'hanwatchesu21s'], ['Conor', 'c_mcg'], ['Priya', 'priyap'],
  ['Marcus', 'marcusfc'], ['Ellie', 'ellie.b'], ['Tom', 'tomonthewing'],
];

export function makePick(player: Player, gwFrom: number, scoutedAt: Date, seed: number): Pick {
  const own = ownershipAt(player, gwFrom - 1);
  return {
    playerId: player.id,
    scoutedAt: scoutedAt.toISOString(),
    gwFrom,
    ownershipAtPick: Number(own.toFixed(1)),
    multiplier: earlyCallFor(own),
    receiptNo: `R-${(gwFrom).toString().padStart(2, '0')}${(seed % 9973).toString().padStart(4, '0')}`,
  };
}

function randomList(r: () => number, seed: number): Pick[] {
  const chosen = new Set<string>();
  const clubs = new Set<string>();
  const picks: Pick[] = [];
  while (picks.length < 5) {
    // rivals lean towards already-popular players, like real people do
    // most people follow the crowd; some dig for early calls
    const pool = r() < 0.35 ? PLAYERS.filter((x) => x.ownership[0] < 2) : PLAYERS;
    const p = pool[Math.floor(r() * pool.length)];
    if (chosen.has(p.id) || clubs.has(p.clubId)) continue;
    chosen.add(p.id); clubs.add(p.clubId);
    const gwFrom = r() < 0.7 ? 1 : 1 + Math.floor(r() * 4);
    const when = new Date(GW1_DATE.getTime() + (gwFrom - 1) * 7 * 864e5 - (1 + r() * 60) * 3600e3);
    picks.push(makePick(p, gwFrom, when, seed * 31 + picks.length));
  }
  return picks;
}

export const RIVAL_ENTRIES: ScoutEntry[] = RIVALS.map(([name, handle], i) => {
  const r = mulberry32(900 + i * 17);
  return { id: `s-${handle}`, name, handle, picks: randomList(r, 900 + i) };
});

/** A ready-made list so first-time visitors can see a season in motion. Picked before GW1. */
export function sampleList(): Pick[] {
  const growth = (p: Player) => p.ownership[6] / p.ownership[0];
  const byGrowth = [...PLAYERS].sort((a, b) => growth(b) - growth(a));
  const out: Player[] = [];
  const clubs = new Set<string>();
  const add = (p?: Player) => { if (p && !clubs.has(p.clubId) && !out.includes(p)) { out.push(p); clubs.add(p.clubId); return true; } return false; };
  // two genuine early calls, then a sensible spine
  add(byGrowth.find((p) => p.position === 'FWD'));
  add(byGrowth.filter((p) => p.position === 'MID')[4]);
  const steady = [...PLAYERS].sort((a, b) => b.weeks.reduce((s, w) => s + w.points, 0) - a.weeks.reduce((s, w) => s + w.points, 0));
  for (const pos of ['GK', 'DEF', 'FWD'] as const) steady.slice(30).filter((p) => p.position === pos && p.ownership[0] > 2).some((p) => add(p));
  const order = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
  out.sort((a, b) => order[a.position] - order[b.position]);
  return out.map((p, i) => makePick(p, 1, new Date(GW1_DATE.getTime() - (20 + i * 7) * 3600e3), 4242 + i));
}

export function entryTotal(picks: Pick[], upto = LAST_COMPLETE_GW) {
  return picks.reduce((a, pk) => a + pickPointsTotal(pk, playerById.get(pk.playerId)!, upto), 0);
}
export function entryGw(picks: Pick[], gw: number) {
  return picks.reduce((a, pk) => a + pickPointsForGw(pk, playerById.get(pk.playerId)!, gw), 0);
}

// Population model for overall rank: simulate a crowd with the same behaviour as rivals.
const crowd = (() => {
  const r = mulberry32(777);
  const totals: number[] = [];
  for (let i = 0; i < 600; i++) totals.push(entryTotal(randomList(r, 5000 + i)));
  totals.sort((a, b) => a - b);
  return totals;
})();

export function overallRank(total: number): number {
  let below = 0;
  for (const t of crowd) if (t < total) below++;
  const share = 1 - below / crowd.length;
  return Math.max(1, Math.round(share * TOTAL_SCOUTS));
}
