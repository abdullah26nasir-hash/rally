import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Users } from 'lucide-react';
import { useGame } from '../store';
import { entryGw, entryTotal, overallRank, RIVAL_ENTRIES } from '../data/scouts';
import { LAST_COMPLETE_GW, TOTAL_SCOUTS } from '../data/source';
import { ordinal } from '../lib/format';
import { Card, Delta, PageTitle } from '../components/bits';
import { Button } from '../components/Button';
import { cn } from '../lib/cn';
import { track } from '../lib/analytics';
import { createSharedLeague, joinSharedLeague, localLeague, getStandings, syncStandings, type Member } from '../lib/leagues';

export function Leagues() {
  const { picks, history, leagues, name: scout, saveSharedLeague } = useGame();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [createErr, setCreateErr] = useState('');
  const total = entryTotal([...picks, ...history]);
  const scoring = picks.some((p) => p.gwFrom <= LAST_COMPLETE_GW);

  return (
    <div>
      <PageTitle eyebrow="Beat your mates" title="Leagues">Private leagues are where Rallycademy gets personal. Make one, send the code to the group chat.</PageTitle>
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        <div className="grid gap-3">
          <Card className="p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0"><div className="font-semibold">Everyone</div><div className="text-[14px] text-newsprint">{TOTAL_SCOUTS.toLocaleString('en-GB')} scouts · simulated preview</div></div>
            <div className="text-right"><div className="display text-[32px] num">{scoring ? ordinal(overallRank(total)) : '–'}</div><div className="text-[12px] text-newsprint">{scoring ? 'your rank' : 'ranks from GW7'}</div></div>
          </Card>
          {leagues.map((l) => {
            const ids = l.members;
            const tab = ids.map((m) => (m === 'you' ? total : entryTotal(RIVAL_ENTRIES.find((r) => r.id === m)?.picks || []))).sort((a, b) => b - a);
            return (
              <Link key={l.id} to={`/leagues/${l.id}`} className="block min-w-0 bg-surface-1 rounded-[8px] shadow-md p-5 hover:bg-flare-wash/40 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="grid place-items-center h-11 w-11 rounded-full bg-flare-wash text-flare"><Users size={20} aria-hidden /></span>
                  <div className="flex-1 min-w-0"><div className="font-semibold truncate">{l.name}</div><div className="text-[14px] text-newsprint">{l.shared ? 'Shared league' : `${ids.length} ${ids.length === 1 ? 'member' : 'members'} · on this device`} · code <span className="font-mono">{l.code}</span></div></div>
                  <div className="text-right"><div className="display text-[32px] num">{!l.shared && ids.length > 1 && scoring ? ordinal(tab.indexOf(total) + 1) : '–'}</div><div className="text-[12px] text-newsprint">{l.shared ? 'open table' : ids.length > 1 ? `of ${ids.length}` : 'waiting for mates'}</div></div>
                </div>
              </Link>
            );
          })}
          {!leagues.length && <p className="text-newsprint text-[15px] px-1">No private leagues yet. Start one below, or join with a code. (Try <span className="font-mono">LADS26</span> for the demo league.)</p>}
          <p className="text-[14px] text-newsprint px-1">Shared leagues let mates join from their own phones. Your list still stays on this device; clearing browser storage loses access to your leagues. Scores are a preview, not verified identities.</p>
        </div>

        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="display text-[26px]">Start a league</h2>
            <form className="mt-3 grid gap-3" onSubmit={async (e) => { e.preventDefault(); if (!name.trim() || busy) return; setBusy(true); setCreateErr(''); try { const remote = await createSharedLeague(name, scout, picks, history); const l = localLeague(remote); saveSharedLeague(l); track('league_created'); setName(''); nav(`/leagues/${l.id}`); } catch (x) { setCreateErr(x instanceof Error ? x.message : 'Could not create league.'); } finally { setBusy(false); } }}>
              <label className="grid gap-1.5"><span className="text-[14px] font-medium">League name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Five-a-side Tuesdays" className="h-12 px-3.5 rounded-[6px] bg-surface-1 border border-hairline text-[16px] focus:outline-2 focus:outline-flare" /></label>
              {createErr && <p role="alert" className="text-[14px] text-flare">{createErr}</p>}
              <Button type="submit" disabled={!name.trim() || busy}>{busy ? 'Creating...' : 'Create league'}</Button>
            </form>
          </Card>
          <Card className="p-5">
            <h2 className="display text-[26px]">Join with a code</h2>
            <form className="mt-3 grid gap-3" onSubmit={async (e) => { e.preventDefault(); if (busy) return; setBusy(true); setErr(''); try { if (code === 'LADS26') { const l = useGame.getState().joinLeague(code); if (l) { nav(`/leagues/${l.id}`); return; } } const { league } = await joinSharedLeague(code, scout, picks, history); const l = localLeague(league); saveSharedLeague(l); track('league_joined'); nav(`/leagues/${l.id}`); } catch (x) { setErr(x instanceof Error ? x.message : 'Could not join league.'); } finally { setBusy(false); } }}>
              <label className="grid gap-1.5"><span className="text-[14px] font-medium">League code</span>
                <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(''); }} maxLength={6} placeholder="6 characters" aria-invalid={!!err} aria-describedby={err ? 'join-err' : undefined} className={cn('h-12 px-3.5 rounded-[6px] bg-surface-1 border text-[16px] font-mono tracking-widest uppercase focus:outline-2 focus:outline-flare', err ? 'border-flare' : 'border-hairline')} /></label>
              {err && <p id="join-err" className="text-[14px] text-flare">{err}</p>}
              <Button type="submit" variant="secondary" disabled={code.length < 6 || busy}>{busy ? 'Joining...' : 'Join league'}</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function LeagueDetail() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const { leagues, picks, history, name: scout } = useGame();
  const [remoteRows, setRemoteRows] = useState<Member[] | null>(null);
  const [remoteErr, setRemoteErr] = useState('');
  const every = [...picks, ...history];
  const [copied, setCopied] = useState(false);
  const [copyFail, setCopyFail] = useState(false);
  const lg = leagues.find((l) => l.id === id);
  useEffect(() => {
    if (!lg?.shared) return;
    let active = true;
    (async () => { try { await syncStandings(lg.code, scout, picks, history); const data = await getStandings(lg.code); if (active) setRemoteRows(data.members); } catch (e) { if (active) setRemoteErr(e instanceof Error ? e.message : 'Could not load league.'); } })();
    return () => { active = false; };
  }, [lg?.code, lg?.shared, scout, picks, history]);
  if (!lg) return <div className="py-20 text-center"><h1 className="display text-[32px]">League not found</h1><Link to="/leagues" className="inline-flex mt-3 min-h-11 items-center text-flare font-semibold">All leagues</Link></div>;
  const rows = (lg.shared ? (remoteRows || []).map((r, i) => ({ id: `member-${i}`, name: r.name, handle: r.you ? 'you' : 'scout', gw: r.gw, total: r.total, you: r.you })) : lg.members.map((m) => {
    if (m === 'you') return { id: 'you', name: 'You', handle: 'you', gw: entryGw(every, LAST_COMPLETE_GW), total: entryTotal(every), you: true };
    const r = RIVAL_ENTRIES.find((x) => x.id === m)!;
    return { id: r.id, name: r.name, handle: r.handle, gw: entryGw(r.picks, LAST_COMPLETE_GW), total: entryTotal(r.picks), you: false };
  })).sort((a, b) => b.total - a.total);
  const prevOrder = [...rows].sort((a, b) => (b.total - b.gw) - (a.total - a.gw)).map((r) => r.id);
  const moved = (id: string, i: number) => prevOrder.indexOf(id) - i;
  const copy = async () => { try { await navigator.clipboard.writeText(`Join my Rallycademy league "${lg.name}": ${location.origin}/join/${lg.code}`); setCopied(true); track('invite_copied'); setTimeout(() => setCopied(false), 2000); } catch { setCopyFail(true); } };

  return (
    <div>
      <button onClick={() => nav('/leagues')} className="inline-flex items-center gap-1.5 min-h-11 -ml-1 px-1 font-semibold text-newsprint hover:text-paper"><ArrowLeft size={18} aria-hidden />Leagues</button>
      <div className="mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div><div className="font-mono text-[12px] uppercase tracking-[0.08em] text-newsprint">Private league · after GW{LAST_COMPLETE_GW}</div><h1 className="display text-[40px] lg:text-[56px] mt-1">{lg.name}</h1></div>
        <Button variant="secondary" onClick={copy}><Copy size={17} aria-hidden />{copied ? 'Invite link copied' : `Copy invite link · ${lg.code}`}</Button>
        <p role="status" className="sr-only">{copied ? 'Invite link copied' : ''}</p>
        {copyFail && <p className="text-[14px] text-newsprint sm:max-w-[300px]">Couldn't copy on this browser. Send this instead: <span className="font-mono text-paper select-all break-all">{location.origin}/join/{lg.code}</span></p>}
      </div>
      {remoteErr && <p role="alert" className="mb-4 text-flare">{remoteErr}</p>}
      {lg.shared && !remoteRows && !remoteErr && <p role="status" className="mb-4 text-newsprint">Loading shared table...</p>}
      {rows.length > 1 && (() => { const i = rows.findIndex((r) => r.you); const above = rows[i - 1]; const below = rows[i + 1]; return (
        <div className="mb-5 grid sm:grid-cols-2 gap-3">
          <div className="rounded-[8px] bg-surface-2 text-paper p-5">
            <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-newsprint">{above ? 'The one to catch' : 'Top of the table'}</div>
            <div className="display text-[32px] mt-1 leading-none">{above ? `${above.name}, ${above.total - rows[i].total} pts ahead` : `You lead by ${rows[i].total - (below?.total ?? 0)} pts`}</div>
            <p className="mt-2 text-[14px] text-newsprint">{above ? `A good week from your five and you pass ${above.name}.` : `${below?.name} is the one behind you.`}</p>
          </div>
          <div className="rounded-[8px] bg-surface-1 shadow-md p-5">
            <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-newsprint">Best GW{LAST_COMPLETE_GW}</div>
            {(() => { const top = [...rows].sort((a, b) => b.gw - a.gw)[0]; return <><div className="display text-[32px] mt-1 leading-none">{top.name} · {top.gw} pts</div><p className="mt-2 text-[14px] text-newsprint">Highest score in the league last gameweek.</p></>; })()}
          </div>
        </div>); })()}
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <caption className="sr-only">{lg.name} table</caption>
          <thead><tr className="border-b border-hairline font-mono text-[12px] uppercase tracking-wide text-newsprint"><th scope="col" className="font-normal pl-4 sm:pl-5 py-3 w-12">#</th><th scope="col" className="font-normal py-3">Scout</th><th scope="col" className="font-normal py-3 text-right">GW{LAST_COMPLETE_GW}</th><th scope="col" className="font-normal pr-4 sm:pr-5 py-3 text-right">Total</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={cn('border-b last:border-0 border-hairline', r.you && 'bg-flare-wash')}>
                <td className="pl-4 sm:pl-5 py-3.5"><div className="display text-[24px] num leading-none">{i + 1}</div>{moved(r.id, i) !== 0 && <Delta value={moved(r.id, i)} className="text-[11px]" />}</td>
                <td className="py-3.5"><div className="font-semibold">{r.name}{r.you && <span className="sr-only"> (you)</span>}</div><div className="text-[13px] text-newsprint font-mono">@{r.handle}</div></td>
                <td className="py-3.5 text-right font-mono num">{r.gw}</td>
                <td className="pr-4 sm:pr-5 py-3.5 text-right display text-[26px] num">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {rows.length === 1 && <p className="mt-4 text-newsprint">Just you so far. Share the code for mates to join.</p>}
      <p className="mt-4 text-[14px] text-newsprint">{lg.shared ? "Shared preview: anyone with the code can join. No login, so scout names and lists aren't verified. This browser holds your identity." : "Older leagues and the demo stay on this device. Make a new shared league to invite mates."}</p>
    </div>
  );
}
