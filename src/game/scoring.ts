import type { Position, WeekStat, Pick, Player } from '../data/types';

export const RULES = {
  appearance: { under60: 1, over60: 2 },
  goal: { GK: 6, DEF: 6, MID: 5, FWD: 4 } as Record<Position, number>,
  assist: 3,
  cleanSheet: { GK: 4, DEF: 4, MID: 1, FWD: 0 } as Record<Position, number>,
  moment: 5,
};

export function weekPoints(pos: Position, w: Omit<WeekStat, 'points'>): number {
  if (w.minutes === 0) return 0;
  let p = w.minutes >= 60 ? RULES.appearance.over60 : RULES.appearance.under60;
  p += w.goals * RULES.goal[pos];
  p += w.assists * RULES.assist;
  if (w.cleanSheet && w.minutes >= 60) p += RULES.cleanSheet[pos];
  if (w.moment) p += RULES.moment;
  return p;
}

/** Early call: the fewer scouts had him when you did, the more his points are worth to you. Locked at pick time. */
export const EARLY_CALL_TIERS = [
  { below: 1, multiplier: 3, label: 'Under 1% had him' },
  { below: 5, multiplier: 2, label: 'Under 5% had him' },
  { below: 15, multiplier: 1.5, label: 'Under 15% had him' },
  { below: Infinity, multiplier: 1, label: '15% or more had him' },
] as const;

export function earlyCallFor(ownership: number): number {
  return EARLY_CALL_TIERS.find((t) => ownership < t.below)!.multiplier;
}

export function pickPointsForGw(pick: Pick, player: Player, gw: number): number {
  if (gw < pick.gwFrom || (pick.gwTo !== undefined && gw > pick.gwTo)) return 0;
  const w = player.weeks.find((x) => x.gw === gw);
  if (!w) return 0;
  return Math.round(w.points * pick.multiplier);
}

export function pickPointsTotal(pick: Pick, player: Player, uptoGw: number): number {
  let t = 0;
  for (let gw = pick.gwFrom; gw <= uptoGw; gw++) t += pickPointsForGw(pick, player, gw);
  return t;
}

export function formLast3(player: Player, uptoGw: number): number {
  return player.weeks.filter((w) => w.gw > uptoGw - 3 && w.gw <= uptoGw).reduce((a, w) => a + w.points, 0);
}

export function seasonPoints(player: Player, uptoGw: number): number {
  return player.weeks.filter((w) => w.gw <= uptoGw).reduce((a, w) => a + w.points, 0);
}

export const fmtPct = (n: number) => (n < 10 ? n.toFixed(1) : Math.round(n).toString()) + '%';
export const fmtMult = (m: number) => '×' + (Number.isInteger(m) ? m.toString() : m.toFixed(1));
