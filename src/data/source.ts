import type { Club, Player, WeekStat } from './types';
import { PLAYERS, CLUBS, playerById, clubById, clubOf, ownershipAt, ownershipNow } from './pool';
import { SEASON, GW1_DATE, LAST_COMPLETE_GW, NEXT_GW, deadlineFor, TOTAL_SCOUTS } from './season';

/** A source has an explicit identity and capability contract. Real data may be incomplete. */
export type DataSourceKind = 'fictional-preview' | 'licensed-live';
export interface Fixture {
  id: string; competitionId: string; homeClubId: string; awayClubId: string;
  kickoffUtc: string; status: 'scheduled' | 'live' | 'final' | 'postponed';
  gameweek: number | null; // null when an external match has no round mapping
}
export interface Appearance {
  fixtureId: string; playerId: string;
  /** Values must come from the source. Unknown is not zero. */
  minutes: number | null; goals: number | null; assists: number | null; cleanSheet: boolean | null;
  points: number | null; moment: WeekStat['moment'] | null;
}
export interface Coverage {
  fixtures: boolean; lineups: boolean; minutes: boolean; goals: boolean;
  assists: boolean; cleanSheets: boolean; moments: boolean;
}
export interface DataSnapshot {
  kind: DataSourceKind;
  sourceName: string;
  season: string;
  fetchedAt: string | null;
  lastCompletedGameweek: number;
  nextGameweek: number;
  totalScouts: number | null;
  clubs: readonly Club[];
  players: readonly Player[];
  fixtures: readonly Fixture[];
  coverage: Coverage;
}
export interface FootballDataSource {
  readonly kind: DataSourceKind;
  load(): Promise<DataSnapshot>;
}

/** Existing game logic stays on the fictional 2026/27 preview until a licensed provider is chosen. */
export const previewSource: FootballDataSource = {
  kind: 'fictional-preview',
  async load() {
    return {
      kind: 'fictional-preview', sourceName: 'Rallycademy fictional preview', season: SEASON,
      fetchedAt: null, lastCompletedGameweek: LAST_COMPLETE_GW,
      nextGameweek: NEXT_GW, totalScouts: TOTAL_SCOUTS,
      clubs: CLUBS, players: PLAYERS, fixtures: [],
      coverage: { fixtures: false, lineups: false, minutes: true, goals: true, assists: true, cleanSheets: true, moments: true },
    };
  },
};

// One import surface for presentation and scoring until a real source is validated.
// Do not silently switch to live: the server must validate coverage, IDs, scoring and receipts first.
export { PLAYERS, CLUBS, playerById, clubById, clubOf, ownershipAt, ownershipNow, SEASON, GW1_DATE, LAST_COMPLETE_GW, NEXT_GW, deadlineFor, TOTAL_SCOUTS };

export function validateSnapshot(snapshot: DataSnapshot): string[] {
  const errors: string[] = [];
  if (snapshot.kind === 'licensed-live') {
    if (!snapshot.fetchedAt || !Number.isFinite(Date.parse(snapshot.fetchedAt))) errors.push('Missing source timestamp');
    if (!snapshot.coverage.fixtures) errors.push('Live mode needs fixture coverage');
    if (!(snapshot.coverage.minutes && snapshot.coverage.goals && snapshot.coverage.assists && snapshot.coverage.cleanSheets)) errors.push('Current scoring needs complete player stat coverage');
    if (!snapshot.coverage.moments) errors.push('Current stamp rules need verified debut/call-up events');
  }
  if (snapshot.nextGameweek !== snapshot.lastCompletedGameweek + 1) errors.push('Gameweek sequence is inconsistent');
  if (new Set(snapshot.players.map((p) => p.id)).size !== snapshot.players.length) errors.push('Duplicate player IDs');
  if (new Set(snapshot.clubs.map((c) => c.id)).size !== snapshot.clubs.length) errors.push('Duplicate club IDs');
  if (snapshot.players.some((p) => !snapshot.clubs.some((c) => c.id === p.clubId))) errors.push('Player without club');
  if (new Set(snapshot.fixtures.map((f) => f.id)).size !== snapshot.fixtures.length) errors.push('Duplicate fixture IDs');
  if (snapshot.fixtures.some((f) => !Number.isFinite(Date.parse(f.kickoffUtc)) || !snapshot.clubs.some((c) => c.id === f.homeClubId) || !snapshot.clubs.some((c) => c.id === f.awayClubId))) errors.push('Fixture date or club invalid');
  return errors;
}
