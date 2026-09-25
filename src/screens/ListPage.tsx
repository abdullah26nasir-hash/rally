import { Link, useNavigate } from 'react-router-dom';
import { Plus, ReceiptText } from 'lucide-react';
import { useGame, MAX_PICKS, isLocked, swapsLeft } from '../store';
import { playerById, clubOf, ownershipNow } from '../data/source';
import { fmtMult, fmtPct, pickPointsTotal } from '../game/scoring';
import { LAST_COMPLETE_GW, NEXT_GW, deadlineFor } from '../data/source';
import { fmtDate, fmtDeadline } from '../lib/format';
import { Monogram } from '../components/Monogram';
import { PageTitle, PosTag } from '../components/bits';
import { Button } from '../components/Button';
import { StampCard } from '../components/StampCard';
import { LevelBar } from '../components/Level';
import { stampsFor, STAMP_INFO, type StampKind } from '../game/stamps';

export function ListPage() {
  const { picks, history, swaps, release } = useGame();
  const nav = useNavigate();
  const locked = isLocked(picks);
  const left = swapsLeft(picks, swaps);
  const order = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
  const sorted = [...picks].sort((a, b) => order[playerById.get(a.playerId)!.position] - order[playerById.get(b.playerId)!.position]);

  return (
    <div>
      <PageTitle eyebrow={locked ? (left ? `1 swap left · deadline ${fmtDeadline(deadlineFor(NEXT_GW))}` : 'Swap used this week') : `Free changes until ${fmtDeadline(deadlineFor(NEXT_GW))}`} title="Your list">
        Five players, each stamped with the moment you scouted him.
      </PageTitle>
      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {sorted.map((pk) => {
          const p = playerById.get(pk.playerId)!;
          const pts = pickPointsTotal(pk, p, LAST_COMPLETE_GW);
          const now = ownershipNow(p);
          return (
            <li key={pk.playerId} className="min-w-0 bg-surface-1 rounded-[8px] shadow-md p-4 flex flex-col">
              <Link to={`/player/${p.id}`} className="flex items-center gap-3 rounded-[6px] -m-1 p-1 hover:bg-flare-wash/50">
                <Monogram player={p} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[17px] truncate">{p.name}</div>
                  <div className="text-[14px] text-newsprint flex items-center gap-2"><PosTag pos={p.position} /><span className="truncate">{clubOf(p).name}</span></div>
                </div>
                <div className="text-right"><div className="display text-[32px] num">{pk.gwFrom > LAST_COMPLETE_GW ? '–' : pts}</div><div className="text-[12px] text-newsprint">{pk.gwFrom > LAST_COMPLETE_GW ? `from GW${pk.gwFrom}` : 'your pts'}</div></div>
              </Link>
              <dl className="mt-4 grid grid-cols-2 min-[400px]:grid-cols-3 gap-2 font-mono text-[12px] min-[400px]:text-[13px]">
                <div><dt className="text-newsprint">Scouted</dt><dd className="font-semibold">{fmtDate(pk.scoutedAt)}</dd></div>
                <div><dt className="text-newsprint">Then → now</dt><dd className="font-semibold num">{fmtPct(pk.ownershipAtPick)} → {fmtPct(now)}</dd></div>
                <div><dt className="text-newsprint">Early call</dt><dd className="font-semibold">{fmtMult(pk.multiplier)}</dd></div>
              </dl>
              <div className="mt-4 pt-3 border-t border-hairline flex gap-2">
                <Button variant="ghost" size="sm" className="-ml-2" onClick={() => nav(`/receipt/${p.id}`)}><ReceiptText size={17} aria-hidden />Receipt</Button>
                {!locked && <Button variant="ghost" size="sm" className="ml-auto text-flare hover:bg-flare/10" onClick={() => release(p.id)}>Remove</Button>}
              </div>
            </li>
          );
        })}
        {Array.from({ length: MAX_PICKS - picks.length }).map((_, i) => (
          <li key={`empty-${i}`}>
            <Link to="/scout" className="h-full min-h-[184px] rounded-[8px] border-2 border-dashed border-hairline grid place-items-center text-center p-6 hover:border-flare hover:bg-flare-wash/40 transition-colors">
              <span><Plus className="mx-auto text-flare" aria-hidden /><span className="block mt-2 font-semibold">Scout player {picks.length + i + 1}</span><span className="block text-[14px] text-newsprint">Quieter names earn bigger early calls</span></span>
            </Link>
          </li>
        ))}
      </ul>

      <section id="stamps" className="mt-12">
        <h2 className="display text-[36px] lg:text-[44px]">Stamp book</h2>
        <p className="text-newsprint mt-1">Every stamp is proof of a call you made. They're yours even if you swap the player out.</p>
        {(() => { const st = stampsFor([...picks, ...history]); const have = new Set(st.map((s) => s.kind)); const missing = (Object.keys(STAMP_INFO) as StampKind[]).filter((k) => !have.has(k)); return (
          <div className="mt-5 grid lg:grid-cols-[320px_1fr] gap-6 items-start">
            <div className="bg-surface-1 rounded-[8px] shadow-md p-5"><LevelBar stamps={st} /></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-5 justify-items-center sm:justify-items-start">
              {st.map((s) => <StampCard key={s.id} stamp={s} />)}
              {missing.map((k) => <div key={k} className="grid gap-1.5 w-[140px]"><StampCard kind={k} locked /><p className="text-[13px] text-newsprint leading-snug">{STAMP_INFO[k].rule}</p></div>)}
            </div>
          </div>); })()}
      </section>
    </div>
  );
}
