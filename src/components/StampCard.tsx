import { Eye, Flag, Star, Radar, Zap, Footprints } from 'lucide-react';
import type { Stamp, StampKind } from '../game/stamps';
import { STAMP_INFO } from '../game/stamps';
import { shirtNumber } from './Monogram';
import { fmtDate } from '../lib/format';
import { cn } from '../lib/cn';

const ICON: Record<StampKind, typeof Eye> = { 'first-call': Eye, 'under-radar': Radar, 'called-it': Star, debut: Footprints, 'call-up': Flag, 'big-week': Zap };

/** A collectible stamp tile. Palette surfaces only (design.md v2.1 rule 3): earned = Ticket + ink border + ink number with a Flare Ink ring; locked = Stock, dashed edge, Pencil. */
export function StampCard({ stamp, size = 'md', locked, kind: lockedKind }: { stamp?: Stamp; size?: 'sm' | 'md'; locked?: boolean; kind?: StampKind }) {
  const kind = stamp?.kind ?? lockedKind!;
  const Icon = ICON[kind];
  const info = STAMP_INFO[kind];
  const w = size === 'sm' ? 64 : 76;
  return (
    <figure
      className={cn('relative shrink-0 rounded-lg border grid place-items-center gap-1 py-2 scroll-ml-4', locked ? 'bg-bg border-dashed border-card-edge' : 'bg-paper border-ink')}
      style={{ width: w, height: Math.round(w * 1.19) }}
      aria-label={locked ? `Locked stamp: ${info.title}. ${info.rule}` : `${info.title} stamp: ${stamp!.player.name}, ${fmtDate(stamp!.earnedAt)}`}
    >
      <span className={cn('grid place-items-center h-8 w-8 rounded-full border-[1.5px]', locked ? 'border-card-edge text-pencil' : 'border-flare-ink text-ink')}>
        {locked ? <Icon size={14} strokeWidth={2} aria-hidden /> : <span className="font-mono font-semibold text-[15px] num">{shirtNumber(stamp!.player)}</span>}
      </span>
      <span className={cn('font-mono font-medium text-[11px] uppercase tracking-[0.05em] text-center leading-[1.25] px-1', locked ? 'text-pencil' : 'text-ink')}>
        {locked ? 'Not yet' : `WK ${String(stamp!.gw).padStart(2, '0')}`}
      </span>
      <figcaption className="sr-only">{info.rule}</figcaption>
    </figure>
  );
}
