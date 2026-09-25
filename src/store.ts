import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { League, Pick } from './data/types';
import { track } from './lib/analytics';
import { makePick, sampleList, RIVAL_ENTRIES } from './data/scouts';
import { NEXT_GW, LAST_COMPLETE_GW } from './data/source';
import { playerById } from './data/source';

export const MAX_PICKS = 5;

interface State {
  mode: 'new' | 'own' | 'sample';
  name: string;
  picks: Pick[];
  following: string[]; // private, device-local preview watchlist; does not score in leagues
  follow: (playerId: string) => void;
  unfollow: (playerId: string) => void;
  history: Pick[]; // swapped-out picks: their points and stamps stay yours
  swaps: Record<number, number>; // gw -> swaps used
  leagues: League[];
  startOwn: (name?: string) => void;
  startSample: () => void;
  scout: (playerId: string) => Pick | null;
  release: (playerId: string) => void;
  swap: (outId: string, inId: string) => Pick | null;
  createLeague: (name: string) => League;
  joinLeague: (code: string) => League | null;
  saveSharedLeague: (league: League) => void;
  reset: () => void;
}

const clubTaken = (picks: Pick[], clubId: string) => picks.some((x) => playerById.get(x.playerId)?.clubId === clubId);

export const isLocked = (picks: Pick[]) => picks.some((p) => p.gwFrom < NEXT_GW);
export const swapsLeft = (picks: Pick[], swaps: Record<number, number>) => (isLocked(picks) ? Math.max(0, 1 - (swaps[NEXT_GW] ?? 0)) : Infinity);

const code = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');

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
      following: [],
      follow: (id) => { if (!playerById.has(id)) return; set({ following: [...new Set([...get().following, id])] }); },
      unfollow: (id) => set({ following: get().following.filter((x) => x !== id) }),
      history: [],
      swaps: {},
      leagues: [],
      startOwn: (name) => { track('season_started', { mode: 'own' }); set({ mode: 'own', picks: [], history: [], swaps: {}, leagues: [], name: name?.trim() || 'You' }); },
      startSample: () => { track('season_started', { mode: 'sample' }); set({ mode: 'sample', picks: sampleList(), history: [], swaps: {}, leagues: [demoLeague()], name: 'You' }); },
      scout: (playerId) => {
        const { picks } = get();
        const p = playerById.get(playerId);
        if (!p || picks.length >= MAX_PICKS || picks.some((x) => x.playerId === playerId)) return null;
        if (clubTaken(picks, p.clubId)) return null;
        if (isLocked(picks)) return null; // after the first deadline, changes go through swap()
        const pk = makePick(p, NEXT_GW, new Date(), Date.now());
        set({ picks: [...picks, pk], mode: get().mode === 'new' ? 'own' : get().mode });
        track('player_scouted', { player_id: p.id, position: p.position, early_call: pk.multiplier, list_size: picks.length + 1 });
        return pk;
      },
      release: (playerId) => {
        const { picks } = get();
        if (isLocked(picks)) return;
        set({ picks: picks.filter((x) => x.playerId !== playerId) });
        track('player_released', { player_id: playerId });
      },
      swap: (outId, inId) => {
        const { picks, swaps, history } = get();
        const p = playerById.get(inId);
        const out = picks.find((x) => x.playerId === outId);
        if (!p || !out || picks.some((x) => x.playerId === inId)) return null;
        if (clubTaken(picks.filter((x) => x !== out), p.clubId)) return null;
        const used = swaps[NEXT_GW] ?? 0;
        if (isLocked(picks) && used >= 1) return null;
        const pk = makePick(p, NEXT_GW, new Date(), Date.now());
        const scored = out.gwFrom <= LAST_COMPLETE_GW;
        set({
          picks: picks.map((x) => (x === out ? pk : x)),
          history: scored ? [...history, { ...out, gwTo: NEXT_GW - 1 }] : history,
          swaps: { ...swaps, [NEXT_GW]: used + (isLocked(picks) ? 1 : 0) },
        });
        track('player_swapped', { out_id: outId, in_id: inId, early_call: pk.multiplier, locked: isLocked(picks) });
        return pk;
      },
      saveSharedLeague: (league) => set({ leagues: [...get().leagues.filter((l) => l.code !== league.code), league] }),
      createLeague: (name) => {
        const lg: League = { id: `lg-${Date.now()}`, name: name.trim(), code: code(), kind: 'private', createdAt: new Date().toISOString(), members: ['you'] };
        set({ leagues: [...get().leagues, lg] });
        track('league_created');
        return lg;
      },
      joinLeague: (c) => {
        const clean = c.trim().toUpperCase();
        const mine = get().leagues.find((l) => l.code === clean);
        if (mine) { track('league_joined', { already_member: true }); return mine; }
        if (clean === 'LADS26') {
          const existing = get().leagues.find((l) => l.code === 'LADS26');
          if (existing) return existing;
          const lg = demoLeague();
          set({ leagues: [...get().leagues, lg] });
          track('league_joined', { demo: true });
          return lg;
        }
        track('league_join_failed');
        return null;
      },
      reset: () => { track('season_reset'); set({ mode: 'new', picks: [], history: [], swaps: {}, leagues: [] }); },
    }),
    {
      name: 'rally-v1',
      // Private browsing or strict settings can block storage. The game still works for the session.
      storage: createJSONStorage(() => ({
        getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
        setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* not saved */ } },
        removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
      })),
      version: 3,
      migrate: (s) => s as State, // older versions had no following; merge() fills it in
      // Stored data can be old, hand-edited or half-written. Keep only what still makes sense.
      merge: (stored, current) => {
        const s = (stored ?? {}) as Partial<State>;
        const known = (a: unknown) => (Array.isArray(a) ? (a as Pick[]).filter((x) => x && playerById.has(x.playerId)) : []);
        const mode = s.mode === 'own' || s.mode === 'sample' ? s.mode : 'new';
        return {
          ...current,
          mode,
          name: typeof s.name === 'string' ? s.name.slice(0, 20) : current.name,
          picks: known(s.picks).slice(0, MAX_PICKS),
          following: Array.isArray(s.following) ? [...new Set(s.following.filter((id): id is string => typeof id === 'string' && playerById.has(id)))].slice(0, 126) : [],
          history: known(s.history),
          swaps: s.swaps && typeof s.swaps === 'object' ? s.swaps : {},
          leagues: Array.isArray(s.leagues) ? s.leagues.filter((l) => l && typeof l.code === 'string' && typeof l.name === 'string') : [],
        };
      },
    },
  ),
);

// Keep two open tabs in step: when one saves, the other reloads its state.
if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key === 'rally-v1') useGame.persist.rehydrate(); });
