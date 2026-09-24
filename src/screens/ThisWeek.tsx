import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Clock } from 'lucide-react';
import { useGame, MAX_PICKS, swapsLeft, isLocked } from '../store';
import { playerById, PLAYERS, clubOf, ownershipNow, ownershipAt } from '../data/pool';
import { entryGw, entryTotal, overallRank, RIVAL_ENTRIES } from '../data/scouts';
import { LAST_COMPLETE_GW, NEXT_GW, deadlineFor, TOTAL_SCOUTS } from '../data/season';
import { fmtDeadline, ordinal } from '../lib/format';
import { fmtMult, fmtPct, pickPointsForGw } from '../game/scoring';
import { Card, Delta, Eyebrow, PosTag } from '../components/bits';
import { Monogram } from '../components/Monogram';
import { Button } from '../components/Button';
import { cn } from '../lib/cn';

export function ThisWeek() {
  const { picks, swaps, leagues } = useGame();
  const lads = leagues.find((l) => l.id === 'lg-sunday');
  const nav = useNavigate();
  const deadline = fmtDeadline(deadlineFor(NEXT_GW));
  const locked = isLocked(picks);

  if (picks.length < MAX_PICKS && !locked) {
    return (
      <div>
        <Eyebrow className="mb-2">Gameweek {NEXT_GW} · deadline {deadline}</Eyebrow>
        <h1 className="display text-[44px] lg:text-[60px]">{picks.length === 0 ? 'Start your list' : `${picks.length} of ${MAX_PICKS} scouted`}</h1>
        <p className="mt-2 text-graphite max-w-[52ch]">Your list starts scoring from Gameweek {NEXT_GW}. Anyone you scout before the deadline is stamped with today's numbers, so the quieter the name, the bigger your early call.</p>
        <Slots count={picks.length} />
        <Button size="lg" className="mt-6" onClick={() => nav('/scout')}>Scout {picks.length === 0 ? 'your first player' : 'the next one'}<ArrowRight size={18} aria-hidden /></Button>
      </div>
    );
  }

  const gwPts = entryGw(picks, LAST_COMPLETE_GW);
  const total = entryTotal(picks);
  const rank = overallRank(total);
  const prevRank = overallRank(entryTotal(picks, LAST_COMPLETE_GW - 1));
  const leagueTable = [...RIVAL_ENTRIES.map((r) => entryTotal(r.picks)), total].sort((a, b) => b - a);
  const leaguePos = leagueTable.indexOf(total) + 1;
  const mine = picks.map((pk) => ({ pk, p: playerById.get(pk.playerId)!, pts: pickPointsForGw(pk, playerById.get(pk.playerId)!, LAST_COMPLETE_GW) }));
  const best = Math.max(...mine.map((m) => m.pts));
  const receipts = picks.filter((pk) => pk.gwFrom <= LAST_COMPLETE_GW && ownershipNow(playerById.get(pk.playerId)!) / pk.ownershipAtPick >= 3);
  const onList = new Set(picks.map((p) => p.playerId));
  const breaking = PLAYERS.filter((p) => !onList.has(p.id))
    .map((p) => ({ p, rise: ownershipNow(p) - ownershipAt(p, LAST_COMPLETE_GW - 1) }))
    .sort((a, b) => b.rise - a.rise).slice(0, 4);
  const left = swapsLeft(picks, swaps);
  const pending = picks.every((p) => p.gwFrom > LAST_COMPLETE_GW);

  return (
    <div className="grid gap-6 lg:gap-8">
      <div>
        <Eyebrow className="mb-2 flex items-center gap-1.5"><Clock size={13} aria-hidden />Gameweek {NEXT_GW} deadline · {deadline}</Eyebrow>
        {pending ? (
          <>
            <h1 className="display text-[44px] lg:text-[60px]">Your list is in.</h1>
            <p className="mt-2 text-graphite max-w-[52ch]">It starts scoring in Gameweek {NEXT_GW}. You can still change anyone before the deadline; after that it's one swap a week.</p>
          </>
        ) : (
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <h1 className="display text-[64px] lg:text-[88px] leading-[0.85]"><span className="sr-only">Gameweek {LAST_COMPLETE_GW}: </span>{gwPts}<span className="text-[28px] lg:text-[34px] ml-2 text-graphite">pts in GW{LAST_COMPLETE_GW}</span></h1>
          </div>
        )}
      </div>

      {!pending && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Stat label="Season" value={total.toString()} sub="points" />
          <Stat label="Overall" value={ordinal(rank)} sub={<Delta value={prevRank - rank} suffix=" places" />} />
          {lads ? <Stat label="Mini-league" value={ordinal(leaguePos)} sub={`of ${leagueTable.length} · ${lads.name}`} to={`/leagues/${lads.id}`} /> : <Stat label="Leagues" value="None yet" sub="Start one with mates" to="/leagues" />}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-6 lg:gap-8 items-start">
        <Card className="p-2 sm:p-3">
          <div className="flex items-baseline justify-between px-3 pt-3 pb-2">
            <h2 className="display text-[26px]">{pending ? 'Your five' : `Your five in GW${LAST_COMPLETE_GW}`}</h2>
            <Link to="/list" className="text-[14px] font-semibold text-biro min-h-11 inline-flex items-center hover:underline underline-offset-4">Your list</Link>
          </div>
          <ul>
            {mine.map(({ pk, p, pts }) => {
              const w = p.weeks.find((x) => x.gw === LAST_COMPLETE_GW)!;
              return (
                <li key={pk.playerId}>
                  <Link to={`/player/${p.id}`} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-3 py-3 rounded-[12px] hover:bg-biro-wash/60">
                    <Monogram player={p} />
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-[14px] text-graphite flex items-center gap-2 min-w-0"><PosTag pos={p.position} /><span className="truncate">{pending ? `${clubOf(p).name} · early call ${fmtMult(pk.multiplier)}` : summary(w)}</span></div>
                    </div>
                    <div className="text-right">
                      {pending ? <span className="font-mono text-[13px] text-graphite">From GW{pk.gwFrom}</span> : (
                        <>
                          <div className="display text-[28px] num"><span className={cn(pts === best && pts > 0 && 'hl')}>{pts}</span></div>
                          <div className="font-mono text-[12px] text-graphite">{w.points} {fmtMult(pk.multiplier)}</div>
                        </>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="grid gap-6">
          <Card className="p-5">
            <h2 className="display text-[26px]">Your five minutes</h2>
            <ul className="mt-3 grid gap-3">
              <Todo done label={pending ? 'List scouted' : `Checked your GW${LAST_COMPLETE_GW} score`} />
              <Todo done={left === 0} label={left === Infinity ? 'Changes are free until the deadline' : left ? '1 swap left this week' : 'Swap used this week'} to={left ? '/scout' : undefined} action="Find a swap" />
              <Todo done={false} label={receipts.length ? `${receipts.length} receipt${receipts.length > 1 ? 's' : ''} worth sharing` : 'Share a receipt when a pick breaks out'} to={receipts.length ? `/receipt/${receipts[0].playerId}` : undefined} action="Share" />
            </ul>
          </Card>

          <Card className="p-2 sm:p-3">
            <div className="px-3 pt-3 pb-1">
              <h2 className="display text-[26px]">Breaking out</h2>
              <p className="text-[14px] text-graphite">Biggest jump in scouts after GW{LAST_COMPLETE_GW}</p>
            </div>
            <ul>
              {breaking.map(({ p, rise }) => (
                <li key={p.id}>
                  <Link to={`/player/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-biro-wash/60">
                    <Monogram player={p} size={36} />
                    <div className="min-w-0 flex-1"><div className="font-semibold truncate text-[15px]">{p.name}</div><div className="text-[13px] text-graphite truncate">{clubOf(p).name} · {p.role}</div></div>
                    <div className="text-right"><div className="font-mono text-[14px] font-semibold">{fmtPct(ownershipNow(p))}</div><Delta value={rise} suffix="%" className="text-[12px]" /></div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <p className="text-[13px] text-graphite">Ranks are out of {TOTAL_SCOUTS.toLocaleString('en-GB')} preview-season scouts (simulated).</p>
    </div>
  );
}

function summary(w: { minutes: number; goals: number; assists: number; cleanSheet: boolean; moment?: string }) {
  if (!w.minutes) return 'Did not play';
  const bits = [`${w.minutes}'`];
  if (w.goals) bits.push(`${w.goals} goal${w.goals > 1 ? 's' : ''}`);
  if (w.assists) bits.push(`${w.assists} assist`);
  if (w.cleanSheet && w.minutes >= 60) bits.push('clean sheet');
  if (w.moment) bits.push(w.moment.toLowerCase());
  return bits.join(' · ');
}
export { summary as weekSummary };

function Stat({ label, value, sub, to }: { label: string; value: string; sub: React.ReactNode; to?: string }) {
  const inner = (
    <>
      <div className="text-[12px] sm:text-[13px] text-graphite truncate">{label}</div>
      <div className="display text-[28px] sm:text-[40px] num mt-1">{value}</div>
      <div className="text-[12px] sm:text-[13px] text-graphite truncate">{sub}</div>
    </>
  );
  return to ? <Link to={to} className="block bg-card rounded-[16px] shadow-md p-3 sm:p-5 hover:bg-biro-wash/40 transition-colors min-w-0">{inner}</Link> : <div className="bg-card rounded-[16px] shadow-md p-3 sm:p-5 min-w-0">{inner}</div>;
}

function Todo({ done, label, to, action }: { done: boolean; label: string; to?: string; action?: string }) {
  return (
    <li className="flex items-center gap-3 min-h-11">
      <span className={cn('grid place-items-center h-6 w-6 rounded-full shrink-0', done ? 'bg-biro text-white' : 'border-2 border-rule')}>{done && <Check size={14} strokeWidth={3} aria-hidden />}<span className="sr-only">{done ? 'Done:' : 'To do:'}</span></span>
      <span className={cn('flex-1', done && 'text-graphite')}>{label}</span>
      {to && action && <Link to={to} className="text-[14px] font-semibold text-biro hover:underline underline-offset-4 min-h-11 inline-flex items-center">{action}</Link>}
    </li>
  );
}

function Slots({ count }: { count: number }) {
  return (
    <div className="mt-6 flex gap-2" role="img" aria-label={`${count} of ${MAX_PICKS} players scouted`}>
      {Array.from({ length: MAX_PICKS }).map((_, i) => (
        <span key={i} className={cn('h-2.5 flex-1 max-w-16 rounded-full', i < count ? 'bg-biro' : 'bg-rule')} />
      ))}
    </div>
  );
}
