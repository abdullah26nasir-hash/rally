import { Eye, Flag, Star, Radar, Zap, Footprints } from 'lucide-react';
import type { Stamp, StampKind } from '../game/stamps';
import { STAMP_INFO } from '../game/stamps';
import { clubOf } from '../data/pool';
import { shirtNumber } from './Monogram';
import { fmtDate } from '../lib/format';
import { cn } from '../lib/cn';

const ICON: Record<StampKind, typeof Eye> = { 'first-call': Eye, 'under-radar': Radar, 'called-it': Star, debut: Footprints, 'call-up': Flag, 'big-week': Zap };

/** A collectible postage stamp. Perforated edge, club colours, one per achievement. */
export function StampCard({ stamp, size = 'md', locked, kind: lockedKind }: { stamp?: Stamp; size?: 'sm' | 'md'; locked?: boolean; kind?: StampKind }) {
  const kind = stamp?.kind ?? lockedKind!;
  const Icon = ICON[kind];
  const info = STAMP_INFO[kind];
  const [a, b] = stamp ? clubOf(stamp.player).colors : ['#E3E6EC', '#FFFFFF'];
  const w = size === 'sm' ? 112 : 140;
  return (
    <div className="shrink-0" style={{ width: w, filter: 'drop-shadow(0 1px 1.5px rgba(15,23,41,.22)) drop-shadow(0 4px 10px rgba(15,23,41,.08))' }}>
    <figure className={cn('stamp-perf relative bg-white p-[7px]', locked && 'opacity-75')} aria-label={locked ? `Locked stamp: ${info.title}. ${info.rule}` : `${info.title} stamp: ${stamp!.player.name}, ${fmtDate(stamp!.earnedAt)}`}>
      <div className="flex flex-col overflow-hidden" style={{ aspectRatio: '4 / 5', background: locked ? 'repeating-linear-gradient(135deg,#F2F3F5 0 6px,#E9EBEF 6px 12px)' : a }}>
        <div className="flex-1 flex items-start justify-between p-2">
          <span className={cn('grid place-items-center h-7 w-7 rounded-full', locked ? 'bg-white/80 text-graphite' : 'bg-white text-ink')}><Icon size={15} strokeWidth={2.2} aria-hidden /></span>
          {!locked && <span className="display text-[24px] leading-none" style={{ color: readable(a) }}>{shirtNumber(stamp!.player)}</span>}
        </div>
        <div className="px-2 pt-1.5 pb-2" style={{ background: locked ? 'rgba(255,255,255,.75)' : b, color: locked ? '#5B6474' : readable(b) }}>
          <div className="display text-[15px] leading-[1] uppercase line-clamp-2 min-h-[30px]">{info.title}</div>
          <div className="font-mono text-[10px] mt-1 truncate">{locked ? 'Not yet' : `${stamp!.player.name.split(' ').slice(-1)[0].toUpperCase()} · GW${stamp!.gw}`}</div>
        </div>
      </div>
      <figcaption className="sr-only">{info.rule}</figcaption>
    </figure>
    </div>
  );
}

function readable(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150 ? '#0F1729' : '#FFFFFF';
}
