export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Club {
  id: string;
  name: string;
  short: string;
  league: string;
  colors: [string, string];
}

export interface WeekStat {
  gw: number;
  minutes: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  /** one-off moments that matter for a young player: senior debut, first call-up */
  moment?: 'Senior debut' | 'First call-up' | 'First senior goal';
  points: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  position: Position;
  role: string;
  clubId: string;
  nation: string;
  weeks: WeekStat[];
  /** % of Rally scouts who had him on their list at the end of each gameweek, index 0 = before GW1 */
  ownership: number[];
}

export interface Pick {
  playerId: string;
  scoutedAt: string; // ISO timestamp
  gwFrom: number; // first gameweek that scores for you
  ownershipAtPick: number;
  multiplier: number;
  receiptNo: string;
  gwTo?: number; // last scoring gameweek, set when swapped out
}

export interface ScoutEntry {
  id: string;
  name: string;
  handle: string;
  picks: Pick[];
  isYou?: boolean;
}

export interface League {
  id: string;
  name: string;
  code: string;
  members: string[]; // ScoutEntry ids
  createdAt: string;
  kind: 'private' | 'global';
}
