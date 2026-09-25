import type { League, Pick } from '../data/types';
const KEY = 'rally-device-id';
function device(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id || !/^[0-9a-f]{64}$/.test(id)) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      id = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch { throw new Error('Shared leagues need this browser to save your device identity. Please allow site storage.'); }
}
async function api<T>(path: string, method = 'GET', data?: object): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/leagues${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-Rally-Device': device() }, body: data ? JSON.stringify(data) : undefined, cache: 'no-store' }); }
  catch { throw new Error('Could not reach the league service. Check your connection and try again.'); }
  let result: { error?: string };
  try { result = await response.json(); } catch { throw new Error('The league service returned an invalid reply. Try again later.'); }
  if (!response.ok) throw new Error(result.error || 'League service unavailable. Try again later.');
  return result as T;
}
export type Member = { name: string; gw: number; total: number; you: boolean };
export type RemoteLeague = { code: string; name: string; createdAt: string };
export const listPayload = (scout: string, picks: Pick[], history: Pick[]) => ({ scout, picks, history });
export function localLeague(remote: RemoteLeague): League { return { id: `shared-${remote.code}`, code: remote.code, name: remote.name, createdAt: remote.createdAt, kind: 'private', members: ['you'], shared: true }; }
export const createSharedLeague = (name: string, scout: string, picks: Pick[], history: Pick[]) => api<RemoteLeague>('', 'POST', { name, ...listPayload(scout, picks, history) });
export const joinSharedLeague = (code: string, scout: string, picks: Pick[], history: Pick[]) => api<{ league: RemoteLeague }>(`/${encodeURIComponent(code)}/join`, 'POST', listPayload(scout, picks, history));
export const getStandings = (code: string) => api<{ league: RemoteLeague; members: Member[] }>(`/${encodeURIComponent(code)}/standings`);
export const syncStandings = (code: string, scout: string, picks: Pick[], history: Pick[]) => api<{ ok: boolean }>(`/${encodeURIComponent(code)}/sync`, 'POST', listPayload(scout, picks, history));
