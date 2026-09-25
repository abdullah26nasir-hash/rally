import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronUp, MessageSquare } from 'lucide-react';
import { Button } from '../components/Button';
import { Sheet } from '../components/Sheet';
import { PageTitle, Card } from '../components/bits';
import { track } from '../lib/analytics';
import { fmtDate } from '../lib/format';
import { cn } from '../lib/cn';
import * as fb from '../lib/feedback';

const day = (iso: string) => fmtDate(iso).toUpperCase();
const STATUS_LABEL: Record<string, string> = { open: '', under_review: 'Under review', planned: 'Planned', shipped: 'Shipped' };
const FILTERS = [['all', 'All'], ['under_review', 'Under review'], ['planned', 'Planned'], ['shipped', 'Shipped']] as const;

function VoteBox({ id, votes, voted, onChange, disabled }: { id: number; votes: number; voted: boolean; disabled?: boolean; onChange?: (voted: boolean, votes: number) => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const shown = votes >= 1000 ? `${(votes / 1000).toFixed(1)}K` : String(votes);
  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (busy || disabled) return;
    setBusy(true);
    try {
      const r = await fb.toggleVote(id);
      onChange?.(r.voted, r.votes);
      setNote(r.voted ? `Vote added. ${r.votes} votes.` : `Vote removed. ${r.votes} votes.`);
      track(r.voted ? 'feedback_vote_added' : 'feedback_vote_removed');
    } catch (err) { setNote(err instanceof Error ? err.message : 'Vote failed.'); }
    finally { setBusy(false); }
  }
  return (
    <>
      <button type="button" onClick={toggle} aria-pressed={!!voted} aria-disabled={disabled || undefined}
        aria-label={`Vote for this request. ${votes} votes.`}
        className={cn('vote relative z-[1]', disabled && 'vote-disabled')}>
        <ChevronUp size={16} strokeWidth={1.5} aria-hidden />
        <span>{shown}</span>
      </button>
      <span className="sr-only" aria-live="polite">{note}</span>
    </>
  );
}

function Row({ r, mine, onVote }: { r: fb.BoardRow; mine: boolean; onVote: (id: number, voted: boolean, votes: number) => void }) {
  return (
    <li className="relative grid grid-cols-[48px_1fr] gap-3 px-4 py-4 min-h-20 hover:bg-ink/[0.04] transition-colors duration-140">
      <VoteBox id={r.id} votes={r.votes} voted={r.voted} onChange={(v, n) => onVote(r.id, v, n)} />
      <div className="min-w-0">
        <Link to={`/feedback/${r.id}`} className="stretched-link font-semibold text-[16px] text-ink line-clamp-2 focus-visible:outline-2 focus-visible:outline-ink focus-visible:-outline-offset-[-2px]">{r.title}</Link>
        <div className="mt-1 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">
          <span>{fb.scoutLabel(r.scout)}</span>
          <span>{day(r.createdAt)}</span>
          {r.comments > 0 && <span className="inline-flex items-center gap-1 normal-case tracking-normal text-[13px] font-medium"><MessageSquare size={14} aria-hidden />{r.comments}</span>}
          {mine && <span>YOURS</span>}
        </div>
        {STATUS_LABEL[r.status] && <span className="mt-2 inline-block rounded-[5px] bg-well px-2 py-0.5 text-[12px] font-medium text-graphite">{STATUS_LABEL[r.status]}</span>}
      </div>
    </li>
  );
}

export function FeedbackBoard() {
  const nav = useNavigate();
  const [filter, setFilter] = useState<string>('all');
  const [sort, setSort] = useState<'top' | 'new'>('top');
  const [data, setData] = useState<fb.BoardPayload | null>(null);
  const [state, setState] = useState<'loading' | 'error' | 'ok'>('loading');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const load = useCallback(async () => {
    setState('loading');
    try { setData(await fb.getBoard(filter, sort)); setState('ok'); }
    catch { setState('error'); }
  }, [filter, sort]);
  useEffect(() => { const t = setTimeout(() => setShowSkeleton(true), 300); load().finally(() => clearTimeout(t)); }, [load]);
  useEffect(() => { track('feedback_board_viewed', { filter, sort }); }, [filter, sort]);
  const onVote = (id: number, voted: boolean, votes: number) => setData((d) => d && { ...d, rows: d.rows.map((r) => r.id === id ? { ...r, voted, votes } : r) });
  return (
    <div className="max-w-[760px]">
      <Link to="/how" className="inline-flex min-h-11 items-center gap-1 font-medium text-[15px] text-ink"><ChevronLeft size={20} aria-hidden />How it works</Link>
      <PageTitle title="Feedback board">Tell us what's missing. Vote on what we build next.</PageTitle>
      <div className="mb-4"><Button className="w-full sm:w-auto" onClick={() => { track('feedback_new_clicked'); nav('/feedback/new'); }}>New request</Button></div>
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-5" role="radiogroup" aria-label="Filter requests">
        {FILTERS.map(([v, label]) => (
          <button key={v} role="radio" aria-checked={filter === v} onClick={() => setFilter(v)}
            className={cn('min-h-11 min-w-11 rounded-[5px] px-3 text-[14px] font-medium', filter === v ? 'bg-well text-ink' : 'text-graphite hover:text-ink')}>{label}</button>
        ))}
        <span className="ml-auto flex gap-4 text-[15px]" role="group" aria-label="Sort">
          {(['top', 'new'] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)} aria-pressed={sort === s}
              className={cn('min-h-11 min-w-11 px-2 capitalize', sort === s ? 'text-ink font-semibold border-b-2 border-ink' : 'text-graphite hover:text-ink')}>{s === 'top' ? 'Top' : 'New'}</button>
          ))}
        </span>
      </div>
      <Card className="overflow-hidden" aria-busy={state === 'loading'}>
        {state === 'loading' && showSkeleton && (
          <ul>{[0, 1, 2, 3].map((i) => (
            <li key={i} className="grid grid-cols-[48px_1fr] gap-3 px-4 py-4 border-b border-hairline last:border-0">
              <div className="h-14 w-12 rounded-md bg-well" />
              <div className="grid content-center gap-2"><div className="h-3 w-[70%] rounded-[2px] bg-well" /><div className="h-3 w-[40%] rounded-[2px] bg-well" /></div>
            </li>))}</ul>
        )}
        {state === 'error' && (
          <div className="p-6">
            <p className="flex items-center gap-2 text-[15px] text-ink"><AlertCircle size={20} aria-hidden />Couldn't load requests.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={load}>Try again</Button>
          </div>
        )}
        {state === 'ok' && data && data.rows.length === 0 && (
          <div className="p-6">
            {filter === 'all'
              ? <><p className="font-semibold text-[17px] text-ink">No requests yet.</p><p className="mt-1 text-graphite">Tell us what's missing.</p></>
              : <p className="text-graphite">{filter === 'shipped' ? 'Nothing shipped yet.' : 'Nothing here yet.'}</p>}
          </div>
        )}
        {state === 'ok' && data && data.rows.length > 0 && (
          <ul className="divide-y divide-hairline">
            {data.rows.map((r) => <Row key={r.id} r={r} mine={r.scout === data.scout} onVote={onVote} />)}
          </ul>
        )}
      </Card>
    </div>
  );
}

export function FeedbackNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [postError, setPostError] = useState('');
  const [busy, setBusy] = useState(false);
  const [similar, setSimilar] = useState<fb.SimilarRow[]>([]);
  const [scout, setScout] = useState(0);
  const [whyOpen, setWhyOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { fb.getScout().then((n) => setScout(n)).catch(() => undefined); }, []);
  useEffect(() => {
    clearTimeout(timer.current);
    if (title.trim().length < 8) { setSimilar([]); return; }
    timer.current = setTimeout(() => { fb.getSimilar(title.trim()).then((r) => setSimilar(r.rows)).catch(() => undefined); }, 400);
    return () => clearTimeout(timer.current);
  }, [title]);
  function validate(): boolean {
    if (title.trim().length < 8) { setError('Title needs at least 8 characters.'); return false; }
    if (title.trim().length > 80) { setError('Keep the title under 80 characters.'); return false; }
    setError(''); return true;
  }
  async function submit() {
    if (!validate() || busy) return;
    setBusy(true); setPostError('');
    try {
      const r = await fb.postRequest(title.trim(), details.trim());
      track('feedback_request_posted');
      nav(`/feedback/${r.id}`);
    } catch (err) { setPostError(err instanceof Error && /Limit reached/.test(err.message) ? err.message : "Couldn't post. Your text is still here. Try again."); }
    finally { setBusy(false); }
  }
  return (
    <div className="max-w-[640px]">
      <Link to="/feedback" className="inline-flex min-h-11 items-center gap-1 font-medium text-[15px] text-ink"><ChevronLeft size={20} aria-hidden />Feedback board</Link>
      <PageTitle title="New request" />
      <Card className="p-5 sm:p-6 grid gap-5">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="fb-title" className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink">What's missing?</label>
            <span className="font-mono text-[12px] text-pencil">{title.trim().length}/80</span>
          </div>
          <input id="fb-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} onBlur={validate}
            className="mt-2 h-12 w-full rounded-md border border-pencil bg-surface-2 px-3 text-[15px] text-ink focus:outline-2 focus:outline-ink" />
          {error && <p className="mt-2 text-[14px] text-offside">{error}</p>}
          {similar.length > 0 && (
            <div className="mt-3">
              <p className="text-[14px] text-graphite">Already asked? Vote instead.</p>
              <ul className="mt-2 divide-y divide-hairline rounded-md border border-card-edge">
                {similar.map((s) => (
                  <li key={s.id} className="relative grid grid-cols-[48px_1fr] items-center gap-3 px-3 py-2">
                    <VoteBox id={s.id} votes={s.votes} voted={s.voted} onChange={(v, n) => setSimilar((rows) => rows.map((x) => x.id === s.id ? { ...x, voted: v, votes: n } : x))} />
                    <Link to={`/feedback/${s.id}`} className="stretched-link text-[15px] font-medium text-ink line-clamp-2">{s.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="fb-details" className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink">Details <span className="text-pencil">(optional)</span></label>
            {details.length >= 800 && <span className="font-mono text-[12px] text-pencil">{details.length}/1000</span>}
          </div>
          <textarea id="fb-details" value={details} maxLength={1000} onChange={(e) => setDetails(e.target.value)}
            className="mt-2 min-h-[120px] w-full rounded-md border border-pencil bg-surface-2 px-3 py-2 text-[15px] text-ink focus:outline-2 focus:outline-ink" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">Posting as {fb.scoutLabel(scout)} from this device</span>
            <Button variant="ghost" size="sm" onClick={() => setWhyOpen(true)}>What's this?</Button>
          </div>
          <Button className="mt-3 w-full sm:w-auto" disabled={title.trim().length < 8 || busy} onClick={submit}>Post request</Button>
          {postError && <p className="mt-2 text-[14px] text-offside">{postError}</p>}
        </div>
      </Card>
      <Sheet open={whyOpen} onOpenChange={setWhyOpen} title="Your scout number">
        <p className="text-ink/85">Your scout number lives on this device. When you make an account, your requests, votes and comments move with you. Clear this browser and it's gone.</p>
        <Button variant="secondary" className="mt-4" onClick={() => setWhyOpen(false)}>Got it</Button>
      </Sheet>
    </div>
  );
}

export function FeedbackRequest() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<{ request: fb.FbRequest; comments: fb.FbComment[]; scout: number } | null>(null);
  const [state, setState] = useState<'loading' | 'error' | 'removed' | 'ok'>('loading');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [postError, setPostError] = useState('');
  const [confirm, setConfirm] = useState<{ kind: 'report' | 'delete'; id: number } | null>(null);
  const load = useCallback(async () => {
    setState('loading');
    try { setData(await fb.getRequest(Number(id))); setState('ok'); }
    catch (err) { setState(err instanceof Error && /removed/.test(err.message) ? 'removed' : 'error'); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (state === 'ok') track('feedback_request_viewed'); }, [state]);
  async function submitComment() {
    if (!text.trim() || busy || !data) return;
    setBusy(true); setPostError('');
    try {
      const c = await fb.postComment(data.request.id, text.trim());
      setData({ ...data, comments: [...data.comments, c] });
      setText(''); track('feedback_comment_posted');
    } catch (err) { setPostError(err instanceof Error ? err.message : "Couldn't post. Your text is still here. Try again."); }
    finally { setBusy(false); }
  }
  async function doConfirm() {
    if (!confirm || !data) return;
    try {
      if (confirm.kind === 'report') {
        await fb.reportComment(confirm.id);
        setData({ ...data, comments: data.comments.map((c) => c.id === confirm.id ? { ...c, reportedByYou: true } : c) });
        track('feedback_comment_reported');
      } else {
        await fb.deleteComment(confirm.id);
        setData({ ...data, comments: data.comments.filter((c) => c.id !== confirm.id) });
      }
    } catch { /* stay silent; the sheet closes and state is unchanged */ }
    setConfirm(null);
  }
  if (state === 'removed') return (
    <div className="max-w-[640px]"><p className="text-[17px] text-ink">This request was removed.</p>
      <Button variant="secondary" className="mt-4" onClick={() => nav('/feedback')}>Back to the board</Button></div>
  );
  if (state === 'error') return (
    <div className="max-w-[640px]"><p className="flex items-center gap-2 text-[15px] text-ink"><AlertCircle size={20} aria-hidden />Couldn't load this request.</p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={load}>Try again</Button></div>
  );
  if (!data) return <div className="max-w-[640px]" aria-busy="true"><div className="h-3 w-[40%] rounded-[2px] bg-well" /><div className="mt-3 h-3 w-[70%] rounded-[2px] bg-well" /></div>;
  const { request: r } = data;
  return (
    <div className="max-w-[640px]">
      <Link to="/feedback" className="inline-flex min-h-11 items-center gap-1 font-medium text-[15px] text-ink"><ChevronLeft size={20} aria-hidden />Feedback board</Link>
      <div className="mt-4 grid grid-cols-[48px_1fr] gap-3">
        <VoteBox id={r.id} votes={r.votes} voted={r.voted} onChange={(v, n) => setData({ ...data, request: { ...r, voted: v, votes: n } })} />
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold text-ink leading-tight">{r.title}</h1>
          <div className="mt-1 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">
            <span>{fb.scoutLabel(r.scout)}</span><span>{day(r.createdAt)}</span>{r.mine && <span>YOURS</span>}
          </div>
          {STATUS_LABEL[r.status] && <span className="mt-2 inline-block rounded-[5px] bg-well px-2 py-0.5 text-[12px] font-medium text-graphite">{STATUS_LABEL[r.status]}</span>}
        </div>
      </div>
      {r.details && <p className="mt-4 max-w-[34em] text-[15px] text-ink whitespace-pre-wrap">{r.details}</p>}
      {r.teamUpdate && (
        <div className="mt-4 border-l-2 border-ink bg-paper rounded-r-lg border-y border-r border-card-edge p-4">
          <div className="flex items-center gap-3"><span className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink">Rallycademy</span>
            {r.teamUpdateAt && <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">{day(r.teamUpdateAt)}</span>}</div>
          <p className="mt-2 text-[15px] text-ink whitespace-pre-wrap">{r.teamUpdate}</p>
        </div>
      )}
      <Card className="mt-6 p-5 sm:p-6">
        <label htmlFor="fb-comment" className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink">Add a comment</label>
        <textarea id="fb-comment" value={text} maxLength={500} onChange={(e) => setText(e.target.value)}
          className="mt-2 min-h-[96px] w-full rounded-md border border-pencil bg-surface-2 px-3 py-2 text-[15px] text-ink focus:outline-2 focus:outline-ink" />
        <div className="mt-2 font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">Commenting as {fb.scoutLabel(data.scout)}</div>
        <Button className="mt-3" disabled={!text.trim() || busy} onClick={submitComment}>Post comment</Button>
        {postError && <p className="mt-2 text-[14px] text-offside">{postError}</p>}
      </Card>
      {data.comments.length > 0 && (
        <Card className="mt-6 overflow-hidden">
          <ul className="divide-y divide-hairline">
            {data.comments.map((c) => (
              <li key={c.id} className={cn('px-4 py-4', c.isTeam && 'border-l-2 border-ink')}>
                <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-pencil">
                  {c.isTeam && <span className="text-ink">Rallycademy</span>}
                  {!c.isTeam && <span>{fb.scoutLabel(c.scout)}</span>}
                  <span>{day(c.createdAt)}</span>
                  {c.underReview && <span>Under review</span>}
                  {!c.mine && !c.reportedByYou && c.body !== null && (
                    <button className="ml-auto min-h-11 px-2 text-graphite hover:text-ink normal-case tracking-normal text-[13px]" onClick={() => setConfirm({ kind: 'report', id: c.id })}>Report</button>
                  )}
                  {c.mine && (
                    <button className="ml-auto min-h-11 px-2 text-graphite hover:text-ink normal-case tracking-normal text-[13px]" onClick={() => setConfirm({ kind: 'delete', id: c.id })}>Delete</button>
                  )}
                </div>
                <p className="mt-2 text-[15px] text-ink whitespace-pre-wrap">
                  {c.body ?? (c.reportedByYou ? <span className="text-[14px] text-pencil">You reported this. Hidden for you while we check.</span> : <span className="text-[14px] text-pencil">Hidden while we check.</span>)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Sheet open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)} title={confirm?.kind === 'report' ? 'Report comment' : 'Delete comment'}>
        <p className="text-ink/85">{confirm?.kind === 'report' ? 'Report this comment for the team to check?' : 'Delete your comment? This cannot be undone.'}</p>
        <div className="mt-4 flex gap-3">
          <Button variant={confirm?.kind === 'report' ? 'ink' : 'danger'} onClick={doConfirm}>{confirm?.kind === 'report' ? 'Report comment' : 'Delete comment'}</Button>
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
        </div>
      </Sheet>
    </div>
  );
}
