import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { playerById, clubOf, ownershipNow, ownershipAt } from '../data/pool';
import { earlyCallFor, fmtMult, fmtPct, formLast3, seasonPoints, RULES } from '../game/scoring';
import { LAST_COMPLETE_GW, NEXT_GW } from '../data/season';
import { useGame, MAX_PICKS, isLocked, swapsLeft } from '../store';
import { Monogram } from '../components/Monogram';
import { Button } from '../components/Button';
import { Card, Delta, Eyebrow, PosTag } from '../components/bits';
import { Sheet } from '../components/Sheet';
import { weekSummary } from './ThisWeek';
import { cn } from '../lib/cn';

export function PlayerPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const p = playerById.get(id);
  const { picks, swaps, scout, swap } = useGame();
  const [swapOpen, setSwapOpen] = useState(false);
  if (!p) return <div className="py-20 text-center"><p className="display text-[32px]">Player not found</p><Link to="/scout" className="text-biro font-semibold">Back to Scout</Link></div>;

  const club = clubOf(p);
  const now = ownershipNow(p);
  const prev = ownershipAt(p, LAST_COMPLETE_GW - 1);
  const mult = earlyCallFor(now);
  const mine = picks.find((x) => x.playerId === p.id);
  const locked = isLocked(picks);
  const left = swapsLeft(picks, swaps);
  const clubClash = picks.find((x) => x.playerId !== p.id && playerById.get(x.playerId)!.clubId === p.clubId);
  const totals = p.weeks.reduce((a, w) => ({ min: a.min + w.minutes, g: a.g + w.goals, a: a.a + w.assists, cs: a.cs + (w.cleanSheet && w.minutes >= 60 ? 1 : 0) }), { min: 0, g: 0, a: 0, cs: 0 });

  const doScout = () => { const pk = scout(p.id); if (pk) nav(`/receipt/${p.id}?new=1`); };

  let action: React.ReactNode;
  if (mine) action = <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => nav(`/receipt/${p.id}`)}><Check size={18} aria-hidden />See receipt</Button>;
  else if (!locked && picks.length < MAX_PICKS && !clubClash) action = <Button size="lg" className="w-full sm:w-auto" onClick={doScout}>Scout him</Button>;
  else if (!locked && picks.length < MAX_PICKS && clubClash) action = <Note>You already have {playerById.get(clubClash.playerId)!.name} from {club.name}. One player per club.</Note>;
  else if (left > 0) action = <Button size="lg" className="w-full sm:w-auto" onClick={() => setSwapOpen(true)}>Swap him in</Button>;
  else action = <Note>You've used this week's swap. Next one opens after the Gameweek {NEXT_GW} deadline.</Note>;

  const maxPts = Math.max(...p.weeks.map((w) => w.points), 1);

  return (
    <div>
      <button onClick={() => (history.length > 1 ? nav(-1) : nav('/scout'))} className="inline-flex items-center gap-1.5 min-h-11 -ml-1 px-1 font-semibold text-graphite hover:text-ink"><ArrowLeft size={18} aria-hidden />Back</button>

      <div className="mt-3 grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10 items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <Monogram player={p} size={72} />
            <div className="min-w-0">
              <Eyebrow>{p.role} · {p.nation}</Eyebrow>
              <h1 className="display text-[44px] sm:text-[60px] leading-[0.9] mt-1">{p.name}</h1>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-graphite"><PosTag pos={p.position} /><span>{club.name}</span><span aria-hidden>·</span><span>{club.league}</span><span aria-hidden>·</span><span>Age {p.age}</span></div>

          <div className="lg:hidden mt-5 flex items-center gap-4 rounded-[14px] bg-card shadow-sm p-4">
            <div className="shrink-0"><div className="text-[13px] text-graphite">{mine ? 'Your early call' : 'Early call now'}</div><div className="display text-[34px] text-biro num leading-none mt-0.5">{fmtMult(mine ? mine.multiplier : mult)}</div></div>
            <div className="flex-1 min-w-0 [&_button]:w-full">{action}</div>
          </div>

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              ['Season points', seasonPoints(p, LAST_COMPLETE_GW)], ['Last 3 GWs', formLast3(p, LAST_COMPLETE_GW)], ['Minutes', totals.min], [p.position === 'GK' || p.position === 'DEF' ? 'Clean sheets' : 'Goals + assists', p.position === 'GK' || p.position === 'DEF' ? totals.cs : `${totals.g} + ${totals.a}`],
            ].map(([k, v]) => (
              <div key={k as string} className="bg-card rounded-[14px] shadow-sm px-4 py-3"><dt className="text-[13px] text-graphite">{k}</dt><dd className="display text-[32px] num">{v}</dd></div>
            ))}
          </dl>

          <Card className="mt-6 p-5">
            <h2 className="display text-[26px]">Week by week</h2>
            <ol className="mt-4 grid gap-2.5">
              {p.weeks.map((w) => (
                <li key={w.gw} className="grid grid-cols-[46px_1fr_36px] items-center gap-3">
                  <span className="font-mono text-[13px] text-graphite">GW{w.gw}</span>
                  <div className="min-w-0">
                    <div className="h-3 rounded-full bg-rule/70 overflow-hidden"><div className={cn('h-full rounded-full', w.moment ? 'bg-ink' : 'bg-biro')} style={{ width: `${(w.points / maxPts) * 100}%` }} /></div>
                    <div className="mt-1 text-[13px] text-graphite truncate">{weekSummary(w)}</div>
                  </div>
                  <span className="display text-[22px] num text-right">{w.points}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="lg:sticky lg:top-10 grid gap-4">
          <Card className="p-5">
            <Eyebrow>Scouts with him</Eyebrow>
            <div className="mt-1 flex items-baseline gap-3"><span className="display text-[48px] num">{fmtPct(now)}</span><Delta value={now - prev} suffix="% this week" /></div>
            <OwnershipChart values={p.ownership} />
            <div className="mt-4 rounded-[12px] bg-biro-wash px-4 py-3">
              <div className="text-[14px] text-ink/80">{mine ? 'Your early call, locked when you scouted him' : 'Scout him now and every point counts'}</div>
              <div className="display text-[40px] text-biro num">{fmtMult(mine ? mine.multiplier : mult)}</div>
            </div>
            <div className="mt-4 hidden lg:block">{action}</div>
          </Card>
          <p className="text-[13px] text-graphite px-1">Points: {RULES.appearance.over60} for 60+ minutes, {RULES.goal[p.position]} a goal, {RULES.assist} an assist{RULES.cleanSheet[p.position] ? `, ${RULES.cleanSheet[p.position]} a clean sheet` : ''}, {RULES.moment} for a big moment. <Link to="/how" className="text-biro font-semibold hover:underline underline-offset-4">All rules</Link></p>
        </div>
      </div>

      <Sheet open={swapOpen} onOpenChange={setSwapOpen} title={`Swap in ${p.name.split(' ')[1]}`} description="Who makes way? This uses your one swap for the week.">
        <ul className="grid gap-2">
          {picks.map((pk) => {
            const out = playerById.get(pk.playerId)!;
            const clash = out.clubId !== p.clubId && picks.some((x) => x.playerId !== out.id && playerById.get(x.playerId)!.clubId === p.clubId);
            return (
              <li key={pk.playerId}>
                <button disabled={clash} onClick={() => { const n = swap(out.id, p.id); setSwapOpen(false); if (n) nav(`/receipt/${p.id}?new=1`); }} className="press w-full flex items-center gap-3 p-3 rounded-[12px] bg-card shadow-sm text-left hover:bg-stamp/5 disabled:opacity-45">
                  <Monogram player={out} size={40} />
                  <span className="flex-1 min-w-0"><span className="block font-semibold truncate">{out.name}</span><span className="block text-[13px] text-graphite">{clash ? 'Club rule: keep one per club' : `Early call ${fmtMult(pk.multiplier)} is lost`}</span></span>
                  <span className="text-[14px] font-semibold text-stamp-deep">Swap out</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </div>
  );
}

const Note = ({ children }: { children: React.ReactNode }) => <p className="text-[15px] text-graphite border border-rule rounded-[12px] px-4 py-3 bg-paper">{children}</p>;

function OwnershipChart({ values }: { values: number[] }) {
  const w = 300, h = 90, max = Math.max(...values) * 1.1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (w - 8) + 4, h - 16 - (v / max) * (h - 24)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full h-auto text-biro" role="img" aria-label={`Share of scouts by gameweek: ${values.map((v) => fmtPct(v)).join(', ')}`}>
      <path d={`${d} L${pts[pts.length - 1][0]},${h - 16} L${pts[0][0]},${h - 16} Z`} fill="currentColor" opacity="0.08" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      {values.map((_, i) => <text key={i} x={pts[i][0]} y={h - 2} fontSize="10" textAnchor={i === 0 ? 'start' : i === values.length - 1 ? 'end' : 'middle'} fill="#5B6474" fontFamily="Spline Sans Mono">{i === 0 ? 'Start' : `GW${i}`}</text>)}
    </svg>
  );
}
