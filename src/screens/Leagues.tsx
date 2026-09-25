import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Users } from 'lucide-react';
import { useGame } from '../store';
import { entryGw, entryTotal, overallRank, RIVAL_ENTRIES } from '../data/scouts';
import { LAST_COMPLETE_GW, TOTAL_SCOUTS } from '../data/season';
import { ordinal } from '../lib/format';
import { Card, Delta, PageTitle } from '../components/bits';
import { Button } from '../components/Button';
import { cn } from '../lib/cn';
import { track } from '../lib/analytics';

export function Leagues() {
  const { picks, history, leagues, createLeague, joinLeague } = useGame();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const total = entryTotal([...picks, ...history]);
  const scoring = picks.some((p) => p.gwFrom <= LAST_COMPLETE_GW);

  return (
    <div>
      <PageTitle eyebrow="Beat your mates" title="Leagues">Private leagues are where Rally gets personal. Make one, send the code to the group chat.</PageTitle>
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        <div className="grid gap-3">
          <Card className="p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0"><div className="font-semibold">Everyone</div><div className="text-[14px] text-graphite">{TOTAL_SCOUTS.toLocaleString('en-GB')} scouts · simulated preview</div></div>
            <div className="text-right"><div className="display text-[32px] num">{scoring ? ordinal(overallRank(total)) : '–'}</div><div className="text-[12px] text-graphite">{scoring ? 'your rank' : 'ranks from GW7'}</div></div>
          </Card>
          {leagues.map((l) => {
            const ids = l.members;
            const tab = ids.map((m) => (m === 'you' ? total : entryTotal(RIVAL_ENTRIES.find((r) => r.id === m)!.picks))).sort((a, b) => b - a);
            return (
              <Link key={l.id} to={`/leagues/${l.id}`} className="block bg-card rounded-[16px] shadow-md p-5 hover:bg-biro-wash/40 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="grid place-items-center h-11 w-11 rounded-full bg-biro-wash text-biro"><Users size={20} aria-hidden /></span>
                  <div className="flex-1 min-w-0"><div className="font-semibold truncate">{l.name}</div><div className="text-[14px] text-graphite">{ids.length} {ids.length === 1 ? 'member' : 'members'} · code <span className="font-mono">{l.code}</span></div></div>
                  <div className="text-right"><div className="display text-[32px] num">{ids.length > 1 && scoring ? ordinal(tab.indexOf(total) + 1) : '–'}</div><div className="text-[12px] text-graphite">{ids.length > 1 ? `of ${ids.length}` : 'waiting for mates'}</div></div>
                </div>
              </Link>
            );
          })}
          {!leagues.length && <p className="text-graphite text-[15px] px-1">No private leagues yet. Start one on the right, or join with a code. (Try <span className="font-mono">LADS26</span> for the demo league.)</p>}
          <p className="text-[14px] text-graphite px-1">Preview: leagues are on this device only. Mates can't join from their own phones yet.</p>
        </div>

        <div className="grid gap-4">
          <Card className="p-5">
            <h2 className="display text-[26px]">Start a league</h2>
            <form className="mt-3 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; const l = createLeague(name); setName(''); nav(`/leagues/${l.id}`); }}>
              <label className="grid gap-1.5"><span className="text-[14px] font-medium">League name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Five-a-side Tuesdays" className="h-12 px-3.5 rounded-[10px] bg-paper border border-rule text-[16px] focus:outline-2 focus:outline-biro" /></label>
              <Button type="submit" disabled={!name.trim()}>Create league</Button>
            </form>
          </Card>
          <Card className="p-5">
            <h2 className="display text-[26px]">Join with a code</h2>
            <form className="mt-3 grid gap-3" onSubmit={(e) => { e.preventDefault(); const l = joinLeague(code); if (l) nav(`/leagues/${l.id}`); else setErr("We couldn't find a league with that code. Check it with whoever sent it."); }}>
              <label className="grid gap-1.5"><span className="text-[14px] font-medium">League code</span>
                <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(''); }} maxLength={6} placeholder="6 characters" aria-invalid={!!err} aria-describedby={err ? 'join-err' : undefined} className={cn('h-12 px-3.5 rounded-[10px] bg-paper border text-[16px] font-mono tracking-widest uppercase focus:outline-2 focus:outline-biro', err ? 'border-stamp' : 'border-rule')} /></label>
              {err && <p id="join-err" className="text-[14px] text-stamp-deep">{err}</p>}
              <Button type="submit" variant="secondary" disabled={code.length < 6}>Join league</Button>
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
  const { leagues, picks, history } = useGame();
  const every = [...picks, ...history];
  const [copied, setCopied] = useState(false);
  const [copyFail, setCopyFail] = useState(false);
  const lg = leagues.find((l) => l.id === id);
  if (!lg) return <div className="py-20 text-center"><h1 className="display text-[32px]">League not found</h1><Link to="/leagues" className="inline-flex mt-3 min-h-11 items-center text-biro font-semibold">All leagues</Link></div>;
  const rows = lg.members.map((m) => {
    if (m === 'you') return { id: 'you', name: 'You', handle: 'you', gw: entryGw(every, LAST_COMPLETE_GW), total: entryTotal(every), you: true };
    const r = RIVAL_ENTRIES.find((x) => x.id === m)!;
    return { id: r.id, name: r.name, handle: r.handle, gw: entryGw(r.picks, LAST_COMPLETE_GW), total: entryTotal(r.picks), you: false };
  }).sort((a, b) => b.total - a.total);
  const prevOrder = [...rows].sort((a, b) => (b.total - b.gw) - (a.total - a.gw)).map((r) => r.id);
  const moved = (id: string, i: number) => prevOrder.indexOf(id) - i;
  const copy = async () => { try { await navigator.clipboard.writeText(`Join my Rally league "${lg.name}": ${location.origin}/join/${lg.code}`); setCopied(true); track('invite_copied'); setTimeout(() => setCopied(false), 2000); } catch { setCopyFail(true); } };

  return (
    <div>
      <button onClick={() => nav('/leagues')} className="inline-flex items-center gap-1.5 min-h-11 -ml-1 px-1 font-semibold text-graphite hover:text-ink"><ArrowLeft size={18} aria-hidden />Leagues</button>
      <div className="mt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div><div className="font-mono text-[12px] uppercase tracking-[0.08em] text-graphite">Private league · after GW{LAST_COMPLETE_GW}</div><h1 className="display text-[40px] lg:text-[56px] mt-1">{lg.name}</h1></div>
        <Button variant="secondary" onClick={copy}><Copy size={17} aria-hidden />{copied ? 'Invite link copied' : `Copy invite link · ${lg.code}`}</Button>
        <p role="status" className="sr-only">{copied ? 'Invite link copied' : ''}</p>
        {copyFail && <p className="text-[14px] text-graphite sm:max-w-[300px]">Couldn't copy on this browser. Send this instead: <span className="font-mono text-ink select-all break-all">{location.origin}/join/{lg.code}</span></p>}
      </div>
      {rows.length > 1 && (() => { const i = rows.findIndex((r) => r.you); const above = rows[i - 1]; const below = rows[i + 1]; return (
        <div className="mb-5 grid sm:grid-cols-2 gap-3">
          <div className="rounded-[16px] bg-ink text-white p-5">
            <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-white/70">{above ? 'The one to catch' : 'Top of the table'}</div>
            <div className="display text-[32px] mt-1 leading-none">{above ? `${above.name}, ${above.total - rows[i].total} pts ahead` : `You lead by ${rows[i].total - (below?.total ?? 0)} pts`}</div>
            <p className="mt-2 text-[14px] text-white/75">{above ? `A good week from your five and you pass ${above.name}.` : `${below?.name} is the one behind you.`}</p>
          </div>
          <div className="rounded-[16px] bg-card shadow-md p-5">
            <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-graphite">Best GW{LAST_COMPLETE_GW}</div>
            {(() => { const top = [...rows].sort((a, b) => b.gw - a.gw)[0]; return <><div className="display text-[32px] mt-1 leading-none">{top.name} · {top.gw} pts</div><p className="mt-2 text-[14px] text-graphite">Highest score in the league last gameweek.</p></>; })()}
          </div>
        </div>); })()}
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <caption className="sr-only">{lg.name} table</caption>
          <thead><tr className="border-b border-rule font-mono text-[12px] uppercase tracking-wide text-graphite"><th scope="col" className="font-normal pl-4 sm:pl-5 py-3 w-12">#</th><th scope="col" className="font-normal py-3">Scout</th><th scope="col" className="font-normal py-3 text-right">GW{LAST_COMPLETE_GW}</th><th scope="col" className="font-normal pr-4 sm:pr-5 py-3 text-right">Total</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={cn('border-b last:border-0 border-rule', r.you && 'bg-highlighter/45')}>
                <td className="pl-4 sm:pl-5 py-3.5"><div className="display text-[24px] num leading-none">{i + 1}</div>{moved(r.id, i) !== 0 && <Delta value={moved(r.id, i)} className="text-[11px]" />}</td>
                <td className="py-3.5"><div className="font-semibold">{r.name}{r.you && <span className="sr-only"> (you)</span>}</div><div className="text-[13px] text-graphite font-mono">@{r.handle}</div></td>
                <td className="py-3.5 text-right font-mono num">{r.gw}</td>
                <td className="pr-4 sm:pr-5 py-3.5 text-right display text-[26px] num">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {rows.length === 1 && <p className="mt-4 text-graphite">Just you so far.</p>}
      <p className="mt-4 text-[14px] text-graphite">Preview: leagues are on this device only, so an invite opened on another phone starts a separate copy. Shared leagues arrive with sign-in.</p>
    </div>
  );
}
