import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { PLAYERS, clubOf, ownershipNow, ownershipAt } from '../data/source';
import { formLast3 } from '../game/scoring';
import { LAST_COMPLETE_GW, NEXT_GW, deadlineFor } from '../data/source';
import { useGame, MAX_PICKS, isLocked, swapsLeft } from '../store';
import { PlayerRow } from '../components/PlayerRow';
import { PageTitle } from '../components/bits';
import { cn } from '../lib/cn';
import { fmtDeadline } from '../lib/format';
import type { Position } from '../data/types';

const SORTS = [
  { id: 'following', label: 'Following', hint: 'Your private watchlist. Following does not use a scoring pick.' },
  { id: 'rising', label: 'Breaking out', hint: 'Biggest jump in scouts last week' },
  { id: 'gems', label: 'Hidden gems', hint: 'In form, but under 5% of scouts have them' },
  { id: 'form', label: 'Form', hint: 'Points over the last 3 gameweeks' },
  { id: 'popular', label: 'Most scouted', hint: 'Share of scouts with him on their list' },
] as const;
type SortId = (typeof SORTS)[number]['id'];
const POSITIONS: Array<'All' | Position> = ['All', 'GK', 'DEF', 'MID', 'FWD'];

export function Scout() {
  const { picks, swaps, following } = useGame();
  const [params] = useSearchParams();
  const first = params.get('first') === '1' && picks.length === 0;
  const [q, setQ] = useState('');
  const [pos, setPos] = useState<'All' | Position>('All');
  const [sort, setSort] = useState<SortId>(first ? 'gems' : 'rising');
  const onList = new Set(picks.map((p) => p.playerId));
  const locked = isLocked(picks);
  const left = swapsLeft(picks, swaps);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let xs = PLAYERS.filter((p) => (pos === 'All' || p.position === pos) && (!needle || p.name.toLowerCase().includes(needle) || clubOf(p).name.toLowerCase().includes(needle)));
    const rise = (p: typeof PLAYERS[number]) => ownershipNow(p) - ownershipAt(p, LAST_COMPLETE_GW - 1);
    if (sort === 'following') xs = xs.filter((p) => following.includes(p.id));
    if (sort === 'gems') xs = xs.filter((p) => ownershipNow(p) < 5).sort((a, b) => formLast3(b, LAST_COMPLETE_GW) - formLast3(a, LAST_COMPLETE_GW));
    if (sort === 'rising') xs = [...xs].sort((a, b) => rise(b) - rise(a));
    if (sort === 'form') xs = [...xs].sort((a, b) => formLast3(b, LAST_COMPLETE_GW) - formLast3(a, LAST_COMPLETE_GW));
    if (sort === 'popular') xs = [...xs].sort((a, b) => ownershipNow(b) - ownershipNow(a));
    return xs;
  }, [q, pos, sort, following]);

  const status = locked
    ? left ? '1 swap left before the deadline' : 'Swap used this week'
    : picks.length < MAX_PICKS ? `${picks.length} of ${MAX_PICKS} scouted · free changes until ${fmtDeadline(deadlineFor(NEXT_GW))}` : 'List full · free changes until the deadline';

  return (
    <div>
      <PageTitle eyebrow={status} title="Scout">
        {PLAYERS.length} under-21s across three divisions. Tap a player to see his weeks and your early call if you scout him now.
      </PageTitle>

      {first && (
        <div className="mb-4 rounded-lg bg-flare-tint border border-card-edge p-4 flex gap-3 items-start anim-fade" role="note">
          <span className="display text-[28px] leading-none text-ink">1</span>
          <p className="text-[15px]">Start with <b>Hidden gems</b>: in-form players almost nobody has yet. Tap one to see his weeks, then scout him.</p>
        </div>
      )}
      <div className="sticky top-14 lg:top-0 z-20 -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 py-3 bg-bg">
        <label className="relative block">
          <span className="sr-only">Search players or clubs</span>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players or clubs" className="w-full h-12 pl-10 pr-11 rounded-md bg-surface-2 border border-pencil text-[16px] placeholder:text-pencil focus:outline-2 focus:outline-ink" />
          {q && <button onClick={() => setQ('')} aria-label="Clear search" className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center h-11 w-11 text-graphite hover:text-ink"><X size={18} /></button>}
        </label>
        <div className="mt-3 flex flex-wrap gap-x-1" role="group" aria-label="Position">
          {POSITIONS.map((p) => (
            <button key={p} onClick={() => setPos(p)} aria-pressed={pos === p} className="press shrink-0 h-11 inline-flex items-center"><span className={cn('h-6 min-w-11 px-2.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.05em] inline-flex items-center justify-center', pos === p ? 'bg-ink text-paper' : 'bg-well text-graphite hover:text-ink')}>{p}</span></button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-1 overflow-x-auto no-scrollbar border-b border-hairline" role="tablist" aria-label="Sort players">
        {SORTS.map((s) => (
          <button key={s.id} role="tab" aria-selected={sort === s.id} onClick={() => setSort(s.id)} className={cn('shrink-0 h-11 px-3 text-[15px] font-semibold border-b-2 -mb-px transition-colors', sort === s.id ? 'border-ink text-ink' : 'border-transparent text-graphite hover:text-ink')}>{s.label}</button>
        ))}
      </div>
      <p className="mt-3 text-[14px] text-graphite">{SORTS.find((s) => s.id === sort)!.hint}</p>

      <div className="hidden sm:grid grid-cols-[44px_1fr_80px_72px_96px] gap-4 px-4 mt-4 text-[12px] font-mono uppercase tracking-wide text-graphite">
        <span /><span>Player</span><span>Last 5</span><span className="text-right">Form</span><span className="text-right">Scouts</span>
      </div>
      {list.length ? (
        <ul className="mt-1 -mx-3 sm:mx-0">{list.map((p) => <PlayerRow key={p.id} player={p} inList={onList.has(p.id)} />)}</ul>
      ) : (
        <div className="mt-10 text-center py-12 bg-paper rounded-[16px] shadow-sm">
          <p className="display text-[26px]">{sort === 'following' && following.length === 0 ? 'No players followed yet' : 'No one matches that'}</p>
          <p className="mt-1 text-graphite">{sort === 'following' && following.length === 0 ? 'Open a player and tap Follow to start a private watchlist.' : 'Try another name or club, or clear the filters.'}</p>
          <button onClick={() => { setQ(''); setPos('All'); setSort('rising'); }} className="mt-4 h-11 px-4 font-semibold text-flare-ink hover:underline underline-offset-4">Clear filters</button>
        </div>
      )}
      <p className="sm:hidden mt-4 text-[13px] text-graphite">"Scouts" is the share of Rallycademy players with him on their list, and the change since last week.</p>
    </div>
  );
}
