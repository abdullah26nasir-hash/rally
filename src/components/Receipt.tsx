import { forwardRef } from 'react';
import type { Pick } from '../data/types';
import { playerById, clubOf, ownershipNow } from '../data/source';
import { fmtMult, fmtPct, pickPointsTotal } from '../game/scoring';
import { fmtStamp } from '../lib/format';
import { LAST_COMPLETE_GW, SEASON } from '../data/source';
import { cn } from '../lib/cn';

interface Props { pick: Pick; scoutName: string; animate?: boolean; className?: string; showPoints?: boolean; showEarly?: boolean; }

/** The Scout Receipt - Rally's signature element and share card. */
export const Receipt = forwardRef<HTMLDivElement, Props>(function Receipt({ pick, scoutName, animate, className, showPoints = true, showEarly = true }, ref) {
  const p = playerById.get(pick.playerId)!;
  const club = clubOf(p);
  const now = ownershipNow(p);
  const pts = pickPointsTotal(pick, p, LAST_COMPLETE_GW);
  const growth = now / Math.max(pick.ownershipAtPick, 0.1);
  const stamp = fmtStamp(pick.scoutedAt);
  const pending = pick.gwFrom > LAST_COMPLETE_GW;

  return (
    <div ref={ref} className={cn('relative w-full max-w-[340px] mx-auto', animate && 'anim-print', className)} style={{ filter: 'drop-shadow(0 2px 2px rgba(15,23,41,.06)) drop-shadow(0 12px 18px rgba(15,23,41,.10))' }}>
      <div className="receipt-paper relative font-mono text-[13px] leading-[1.55] text-ink" style={{ clipPath: 'polygon(' + serrated() + ')' }}>
        <div className="px-6 pt-8 pb-9">
          <div className="flex items-baseline justify-between">
            <span className="display text-[26px] tracking-tight not-italic font-sans" style={{ fontFamily: 'var(--font-display)' }}>RALLY</span>
            <span className="text-graphite text-[11px]">NO. {pick.receiptNo}</span>
          </div>
          <div className="text-[11px] text-graphite uppercase tracking-wide">Scouting receipt · {SEASON}</div>
          <Dash />
          <div className="text-[11px] uppercase tracking-wide text-graphite">Scouted</div>
          <div className={cn('display text-[clamp(24px,9.5vw,40px)] leading-[0.95] mt-1 break-words', animate && 'anim-stage-1')} style={{ fontFamily: 'var(--font-display)' }}>{p.name.toUpperCase()}</div>
          <div className={cn('mt-1.5', animate && 'anim-stage-1')}>{p.role} · {club.name} · Age {p.age}</div>
          <Dash />
          <div className={cn(animate && 'anim-stage-2')}>
          <Line k="Scouted by" v={'@' + scoutName} />
          <Line k="Had him when you did" v={fmtPct(pick.ownershipAtPick)} />
          <Line k="Have him now" v={fmtPct(now)} strong />
          {showEarly && <Line k="Early call" v={fmtMult(pick.multiplier)} />}
          {showPoints && <Line k="Your points from him" v={pending ? 'From GW' + pick.gwFrom : String(pts)} />}
          </div>
          <Dash />
          {!pending && growth >= 2 ? (
            <p className="text-[13px]"><span className="hl font-semibold">{Math.round(growth)}× more scouts</span> have him now than when you called it.</p>
          ) : (
            <p className="text-[13px] text-graphite">Kept on file. If he breaks out, this is your proof.</p>
          )}
          <div className="mt-5 flex items-end justify-between gap-3">
            <Barcode seed={pick.receiptNo} />
            <div className="shrink-0" style={{ transform: 'rotate(-6deg)' }}><div className={cn('border-[2.5px] border-stamp text-stamp rounded-md px-2.5 py-1.5 text-center leading-tight', animate && 'anim-stamp')} aria-label={`Scouted ${stamp.day} at ${stamp.time}`}>
              <div className="text-[10px] font-semibold tracking-widest">SCOUTED</div>
              <div className="text-[12px] font-semibold whitespace-nowrap">{stamp.day}</div>
              <div className="display text-[22px]" style={{ fontFamily: 'var(--font-display)' }}>{stamp.time}</div>
            </div></div>
          </div>
          <div className="mt-4 text-center text-[10px] text-graphite tracking-wide">FREE TO PLAY · BRAGGING RIGHTS ONLY</div>
        </div>
      </div>
    </div>
  );
});

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-graphite">{k}</span>
      <span className="flex-1 border-b border-dotted border-graphite/40 translate-y-[-3px]" />
      <span className={cn('num', strong && 'font-semibold')}>{v}</span>
    </div>
  );
}
const Dash = () => <div className="my-3.5 border-t border-dashed border-ink/25" />;

function Barcode({ seed }: { seed: string }) {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < 34; i++) { h = (h * 1103515245 + 12345) >>> 0; bars.push(1 + (h % 3)); }
  let x = 0;
  return (
    <svg width="130" height="34" viewBox="0 0 150 34" preserveAspectRatio="none" aria-hidden>
      {bars.map((w, i) => { const r = <rect key={i} x={x} y="0" width={w} height="34" fill={i % 2 ? 'transparent' : '#0F1729'} />; x += w + 1.2; return r; })}
    </svg>
  );
}

function serrated() {
  const teeth = 28, h = 7, pts: string[] = [];
  for (let i = 0; i <= teeth; i++) pts.push(`${(i / teeth) * 100}% ${i % 2 ? h : 0}px`);
  for (let i = teeth; i >= 0; i--) pts.push(`${(i / teeth) * 100}% calc(100% - ${i % 2 ? h : 0}px)`);
  return pts.join(',');
}
