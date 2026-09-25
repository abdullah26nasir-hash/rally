// Feedback board client. Same device identity as shared leagues (rally-device-id).
const KEY = 'rally-device-id';
export function device(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id || !/^[0-9a-f]{64}$/.test(id)) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      id = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch { throw new Error('The feedback board needs this browser to save your device identity. Please allow site storage.'); }
}
async function api<T>(path: string, method = 'GET', data?: object): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/feedback${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-Rally-Device': device() }, body: data ? JSON.stringify(data) : undefined, cache: 'no-store' }); }
  catch { throw new Error('Could not reach the feedback service. Check your connection and try again.'); }
  let result: { error?: string };
  try { result = await response.json(); } catch { throw new Error('The feedback service returned an invalid reply. Try again later.'); }
  if (!response.ok) throw new Error(result.error || 'Feedback service unavailable. Try again later.');
  return result as T;
}
export type BoardRow = { id: number; title: string; status: string; createdAt: string; scout: number; votes: number; comments: number; voted: boolean };
export type BoardPayload = { rows: BoardRow[]; openCount: number; scout: number };
export type SimilarRow = { id: number; title: string; votes: number; voted: boolean };
export type FbComment = { id: number; body: string | null; isTeam: boolean; createdAt: string; scout: number; mine: boolean; reportedByYou: boolean; underReview: boolean };
export type FbRequest = { id: number; title: string; details: string; status: string; teamUpdate: string | null; teamUpdateAt: string | null; createdAt: string; scout: number; votes: number; voted: boolean; mine: boolean };
export const getBoard = (filter: string, sort: string) => api<BoardPayload>(`/board?filter=${filter}&sort=${sort}`);
export const getSimilar = (q: string) => api<{ rows: SimilarRow[] }>(`/similar?q=${encodeURIComponent(q)}`);
export const postRequest = (title: string, details: string) => api<FbRequest>('/requests', 'POST', { title, details });
export const getRequest = (id: number) => api<{ request: FbRequest; comments: FbComment[]; scout: number }>(`/requests/${id}`);
export const toggleVote = (id: number) => api<{ voted: boolean; votes: number }>(`/requests/${id}/vote`, 'POST');
export const postComment = (id: number, body: string) => api<FbComment>(`/requests/${id}/comments`, 'POST', { body });
export const deleteComment = (cid: number) => api<{ ok: boolean }>(`/comments/${cid}`, 'DELETE');
export const reportComment = (cid: number) => api<{ ok: boolean }>(`/comments/${cid}/report`, 'POST');
export type LandingRow = { id: number; title: string; status: string; createdAt: string; votes: number };
export type LandingPayload = { rows: LandingRow[]; openCount: number; totalVotes: number };
export async function getLanding(): Promise<LandingPayload | null> {
  try {
    const r = await fetch('/api/feedback/landing', { cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json() as LandingPayload;
  } catch { return null; }
}
export const scoutLabel = (n: number) => `SCOUT #${String(n).padStart(4, '0')}`;
export const getScout = () => api<{ scout: number }>('/scout').then((r) => r.scout);
