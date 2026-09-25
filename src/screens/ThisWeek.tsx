import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGame, MAX_PICKS, swapsLeft, isLocked } from '../store';
import { playerById, PLAYERS, clubOf, ownershipNow, ownershipAt } from '../data/source';
import { entryGw, entryTotal, overallRank, RIVAL_ENTRIES } from '../data/scouts';
import { LAST_COMPLETE_GW, NEXT_GW, deadlineFor, TOTAL_SCOUTS } from '../data/source';
import { fmtDeadline, ordinal } from '../lib/format';
import { fmtMult, fmtPct, pickPointsForGw } from '../game/scoring';
import { stampsFor } from '../game/stamps';
import { Card, Delta, Eyebrow } from '../components/bits';
import { Monogram } from '../components/Monogram';
import { Button } from '../components/Button';
import { EventIcons } from '../components/EventIcons';
import { Slip, SlipRule } from '../components/Slip';
import { StampCard } from '../components/StampCard';
import { LevelBar } from '../components/Level';
import { cn } from '../lib/cn';
import { track } from '../lib/analytics';

export function ThisWeek() {
  const { picks, history, swaps, leagues, name, mode } = useGame();
  const every = [...picks, ...history];
  const nav = useNavigate();
  const [gw, setGw] = useState(LAST_COMPLETE_GW);
  useEffect(() => { track('slip_viewed', { gw, latest: gw === LAST_COMPLETE_GW }); }, [gw]);
  const locked = isLocked(picks);
  const stamps = stampsFor(every);

  if (picks.length < MAX_PICKS && !locked) {
    return (
      <div className="max-w-[640px]">
        <Eyebrow className="mb-2">Gameweek {NEXT_GW} · deadline {fmtDeadline(deadlineFor(NEXT_GW))}</Eyebrow>
        <h1 className="display text-[44px] lg:text-[60px]">{picks.length === 0 ? 'Start your list' : `${picks.length} of ${MAX_PICKS} scouted`}</h1>
        <p className="mt-2 text-graphite max-w-[52ch]">Your list starts scoring from Gameweek {NEXT_GW}. Everyone you scout before the deadline is stamped with today's numbers, so the quieter the name, the bigger your early call.</p>
        <Slots count={picks.length} />
        <Button size="lg" className="mt-6" onClick={() => nav('/scout')}>Scout {picks.length === 0 ? 'your first player' : 'the next one'}<ArrowRight size={18} aria-hidden /></Button>
        {stamps.length > 0 && <div className="mt-10 min-w-0"><Card className="p-5 min-w-0"><LevelBar stamps={stamps} compact /><div tabIndex={0} role="region" aria-label="Recent stamps" className="stamp-row mt-4">{stamps.map((s) => <StampCard key={s.id} stamp={s} size="sm" />)}</div></Card></div>}
      </div>
    );
  }

  const upcoming = gw > LAST_COMPLETE_GW;
  const pending = picks.every((p) => p.gwFrom > LAST_COMPLETE_GW);
  const total = entryTotal(every, Math.min(gw, LAST_COMPLETE_GW));
  const gwPts = entryGw(every, gw);
  const rank = overallRank(total);
  const prevRank = overallRank(entryTotal(every, Math.min(gw, LAST_COMPLETE_GW) - 1));
  const lads = leagues.find((l) => l.id === 'lg-sunday');
  const table = [...RIVAL_ENTRIES.map((r) => ({ name: r.name, total: entryTotal(r.picks, Math.min(gw, LAST_COMPLETE_GW)) })), { name: 'You', total }].sort((a, b) => b.total - a.total);
  const pos = table.findIndex((r) => r.name === 'You');
  const rival = pos > 0 ? { text: `${table[pos - 1].total - total} pts behind ${table[pos - 1].name}`, ahead: false } : { text: `${total - table[1].total} pts clear of ${table[1].name}`, ahead: true };
  // The slip for a past week shows who was on your list that week, including players you've since swapped out.
  const past = history.filter((pk) => (pk.gwTo ?? 0) >= gw);
  const slip = past.length ? [...past, ...picks.filter((pk) => pk.gwFrom <= gw)] : picks;
  const mine = slip.map((pk) => ({ pk, p: playerById.get(pk.playerId)! })).map((m) => ({ ...m, pts: pickPointsForGw(m.pk, m.p, gw) }));
  const onList = new Set(picks.map((p) => p.playerId));
  const breaking = PLAYERS.filter((p) => !onList.has(p.id)).map((p) => ({ p, rise: ownershipNow(p) - ownershipAt(p, LAST_COMPLETE_GW - 1) })).sort((a, b) => b.rise - a.rise).slice(0, 4);
  const left = swapsLeft(picks, swaps);
  const receipts = picks.filter((pk) => pk.gwFrom <= LAST_COMPLETE_GW && ownershipNow(playerById.get(pk.playerId)!) / pk.ownershipAtPick >= 3);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:gap-8">
      {/* gameweek pager */}
      {mode === 'sample' && <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-flare-tint px-4 py-2 text-[14px]"><span>You're trying the sample season.</span><Link to="/how" className="min-h-11 inline-flex items-center font-semibold text-flare-ink shrink-0">Play your own</Link></div>}
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setGw((g) => Math.max(1, g - 1))} aria-disabled={gw <= 1} className="press grid place-items-center h-11 w-11 rounded-full bg-paper shadow-sm aria-disabled:opacity-40" aria-label="Previous gameweek"><ChevronLeft size={20} aria-hidden /></button>
        <div className="text-center" aria-live="polite">
          <h1 className="display text-[26px] leading-none">Gameweek {gw}</h1>
          <div className="font-mono text-[12px] text-graphite mt-1">{upcoming ? `Deadline ${fmtDeadline(deadlineFor(gw))}` : gw === LAST_COMPLETE_GW ? 'Latest result' : 'Past result'}</div>
        </div>
        <button onClick={() => setGw((g) => Math.min(NEXT_GW, g + 1))} aria-disabled={gw >= NEXT_GW} className="press grid place-items-center h-11 w-11 rounded-full bg-paper shadow-sm aria-disabled:opacity-40" aria-label="Next gameweek"><ChevronRight size={20} aria-hidden /></button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        {/* the gameweek slip */}
        <Slip>
          <div className="px-5 sm:px-6 pt-5 pb-8 font-mono text-[13px]">
            <div className="flex justify-between text-graphite text-[11px] uppercase tracking-wide"><span>Rallycademy · GW{gw} slip</span><span>@{name.toLowerCase()}</span></div>
            {upcoming || pending ? (
              <div className="py-5">
                <div className="font-sans display text-[44px] leading-[0.9]" style={{ fontFamily: 'var(--font-display)' }}>{pending ? 'Your list is in.' : 'Not kicked off yet.'}</div>
                <p className="mt-2 font-sans text-[15px] text-ink/75">{left === Infinity ? 'Free changes until the deadline.' : left ? 'One swap left before the deadline.' : 'Swap used. Your five are locked in.'}</p>
              </div>
            ) : (
              <div className="py-4 flex items-end justify-between gap-4">
                <div><div className="text-graphite text-[11px] uppercase tracking-wide">Points</div><div className="display text-[88px] leading-[0.8] num" style={{ fontFamily: 'var(--font-display)' }}>{gwPts}</div></div>
                <div className="text-right pb-1"><div><span className={rival.ahead ? 'receipt-keyline' : 'font-semibold text-[14px]'}>{rival.text}</span></div><div className="text-graphite mt-1">{lads ? lads.name : 'Mini-league'}</div></div>
              </div>
            )}
            <SlipRule />
            <ul className="py-2">
              {mine.map(({ pk, p, pts }) => {
                const w = p.weeks.find((x) => x.gw === gw);
                return (
                  <li key={pk.playerId}>
                    <Link to={`/player/${p.id}`} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 py-2 -mx-2 px-2 rounded-[8px] hover:bg-well">
                      <Monogram player={p} size={36} />
                      <div className="min-w-0 font-sans">
                        <div className="font-semibold text-[15px] truncate">{p.name}</div>
                        <div className="text-[13px] text-graphite truncate">{w && gw >= pk.gwFrom ? <EventIcons w={w} /> : gw < pk.gwFrom && !upcoming ? 'Not on your list yet' : `${clubOf(p).name} · ${fmtMult(pk.multiplier)}`}</div>
                      </div>
                      <div className="text-right">{upcoming || gw < pk.gwFrom ? <span className="text-graphite">{fmtMult(pk.multiplier)}</span> : <><span className="display text-[26px] num font-sans" style={{ fontFamily: 'var(--font-display)' }}>{pts}</span><div className="text-[11px] text-graphite">{w?.points ?? 0} {fmtMult(pk.multiplier)}</div></>}</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {!upcoming && !pending && <>
              <SlipRule />
              <div className="pt-3 grid gap-1">
                <Row k="Season total" v={`${total} pts`} />
                <Row k="Overall" v={<>{ordinal(rank)} <Delta value={prevRank - rank} className="text-[12px]" /></>} />
                <Row k="Mini-league" v={`${ordinal(pos + 1)} of ${table.length}`} />
              </div>
            </>}
          </div>
        </Slip>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 min-w-0">
          <Card className="p-5 min-w-0">
            <LevelBar stamps={stamps} compact />
            <div tabIndex={0} role="region" aria-label="Recent stamps" className="stamp-row mt-4">{stamps.slice(0, 6).map((s) => <StampCard key={s.id} stamp={s} size="sm" />)}</div>
            <Link to="/list#stamps" className="mt-2 inline-flex min-h-11 items-center text-[14px] font-semibold text-flare-ink hover:underline underline-offset-4">Stamp book · {stamps.length} collected</Link>
          </Card>
          <Card className="p-5">
            <h2 className="display text-[26px]">Your five minutes</h2>
            <ul className="mt-2 grid gap-1">
              <Todo done label={`Checked your GW${LAST_COMPLETE_GW} slip`} />
              <Todo done={left === 0} label={left === Infinity ? 'Changes are free until the deadline' : left ? '1 swap left this week' : 'Swap used this week'} to={left ? '/scout' : undefined} action="Find a swap" />
              <Todo done={false} label={receipts.length ? `${receipts.length} receipt${receipts.length > 1 ? 's' : ''} worth sharing` : 'Share a receipt when a pick breaks out'} to={receipts.length ? `/receipt/${receipts[0].playerId}` : undefined} action="Share" />
            </ul>
          </Card>
        </div>
      </div>

      <Card className="p-2 sm:p-3">
        <div className="px-3 pt-3 pb-1"><h2 className="display text-[26px]">Breaking out</h2><p className="text-[14px] text-graphite">Biggest jump in scouts after GW{LAST_COMPLETE_GW}. Not on your list.</p></div>
        <ul className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2">
          {breaking.map(({ p, rise }) => (
            <li key={p.id}><Link to={`/player/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-well">
              <Monogram player={p} size={40} />
              <div className="min-w-0 flex-1"><div className="font-semibold truncate text-[15px]">{p.name}</div><div className="text-[13px] text-graphite truncate">{clubOf(p).name} · {p.role}</div></div>
              <div className="text-right"><div className="font-mono text-[14px] font-semibold">{fmtPct(ownershipNow(p))}</div><Delta value={rise} suffix="%" className="text-[12px]" /></div>
            </Link></li>
          ))}
        </ul>
      </Card>
      <p className="text-[13px] text-graphite">Ranks are out of {TOTAL_SCOUTS.toLocaleString('en-GB')} preview-season scouts (simulated).</p>
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex items-baseline gap-2"><span className="text-graphite">{k}</span><span className="flex-1 border-b border-dotted border-graphite/40 -translate-y-[3px]" /><span className="font-semibold num">{v}</span></div>
);

function Todo({ done, label, to, action }: { done: boolean; label: string; to?: string; action?: string }) {
  return (
    <li className="flex items-center gap-3 min-h-11">
      <span className={cn('grid place-items-center h-6 w-6 rounded-full shrink-0', done ? 'bg-flare text-ink border border-ink' : 'border-2 border-hairline')}>{done && <Check size={14} strokeWidth={3} aria-hidden />}<span className="sr-only">{done ? 'Done:' : 'To do:'}</span></span>
      <span className={cn('flex-1', done && 'text-graphite')}>{label}</span>
      {to && action && <Link to={to} className="text-[14px] font-semibold text-flare-ink hover:underline underline-offset-4 min-h-11 min-w-11 justify-end inline-flex items-center">{action}</Link>}
    </li>
  );
}

function Slots({ count }: { count: number }) {
  return (
    <div className="mt-6 flex gap-2" role="img" aria-label={`${count} of ${MAX_PICKS} players scouted`}>
      {Array.from({ length: MAX_PICKS }).map((_, i) => <span key={i} className={cn('h-2.5 flex-1 max-w-16 rounded-full', i < count ? 'bg-flare' : 'bg-rule')} />)}
    </div>
  );
}
