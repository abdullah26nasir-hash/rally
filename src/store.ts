import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { League, Pick } from './data/types';
import { makePick, sampleList, RIVAL_ENTRIES } from './data/scouts';
import { NEXT_GW } from './data/season';
import { playerById } from './data/pool';

export const MAX_PICKS = 5;

interface State {
  mode: 'new' | 'own' | 'sample';
  name: string;
  picks: Pick[];
  swaps: Record<number, number>; // gw -> swaps used
  leagues: League[];
  startOwn: () => void;
  startSample: () => void;
  scout: (playerId: string) => Pick | null;
  release: (playerId: string) => void;
  swap: (outId: string, inId: string) => Pick | null;
  createLeague: (name: string) => League;
  joinLeague: (code: string) => League | null;
  reset: () => void;
}

export const isLocked = (picks: Pick[]) => picks.some((p) => p.gwFrom < NEXT_GW);
export const swapsLeft = (picks: Pick[], swaps: Record<number, number>) => (isLocked(picks) ? Math.max(0, 1 - (swaps[NEXT_GW] ?? 0)) : Infinity);

const code = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 30)]).join('');

const demoLeague = (): League => ({
  id: 'lg-sunday', name: 'Sunday League Lads', code: 'LADS26', kind: 'private', createdAt: '2026-08-10T19:00:00+01:00',
  members: ['you', ...RIVAL_ENTRIES.map((r) => r.id)],
});

export const useGame = create<State>()(
  persist(
    (set, get) => ({
      mode: 'new',
      name: 'You',
      picks: [],
      swaps: {},
      leagues: [],
      startOwn: () => set({ mode: 'own', picks: [], swaps: {}, leagues: [] }),
      startSample: () => set({ mode: 'sample', picks: sampleList(), swaps: {}, leagues: [demoLeague()] }),
      scout: (playerId) => {
        const { picks } = get();
        const p = playerById.get(playerId);
        if (!p || picks.length >= MAX_PICKS || picks.some((x) => x.playerId === playerId)) return null;
        if (isLocked(picks)) return null; // after the first deadline, changes go through swap()
        const pk = makePick(p, NEXT_GW, new Date(), Date.now());
        set({ picks: [...picks, pk], mode: get().mode === 'new' ? 'own' : get().mode });
        return pk;
      },
      release: (playerId) => {
        const { picks } = get();
        if (isLocked(picks)) return;
        set({ picks: picks.filter((x) => x.playerId !== playerId) });
      },
      swap: (outId, inId) => {
        const { picks, swaps } = get();
        const p = playerById.get(inId);
        if (!p) return null;
        const used = swaps[NEXT_GW] ?? 0;
        if (isLocked(picks) && used >= 1) return null;
        const pk = makePick(p, NEXT_GW, new Date(), Date.now());
        set({ picks: picks.map((x) => (x.playerId === outId ? pk : x)), swaps: { ...swaps, [NEXT_GW]: used + (isLocked(picks) ? 1 : 0) } });
        return pk;
      },
      createLeague: (name) => {
        const lg: League = { id: `lg-${Date.now()}`, name: name.trim(), code: code(), kind: 'private', createdAt: new Date().toISOString(), members: ['you'] };
        set({ leagues: [...get().leagues, lg] });
        return lg;
      },
      joinLeague: (c) => {
        const clean = c.trim().toUpperCase();
        if (clean === 'LADS26') {
          const existing = get().leagues.find((l) => l.code === 'LADS26');
          if (existing) return existing;
          const lg = demoLeague();
          set({ leagues: [...get().leagues, lg] });
          return lg;
        }
        return null;
      },
      reset: () => set({ mode: 'new', picks: [], swaps: {}, leagues: [] }),
    }),
    { name: 'rally-v1' },
  ),
);
