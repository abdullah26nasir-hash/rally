import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { Player } from '../data/types';
import { clubOf, ownershipNow, ownershipAt } from '../data/source';
import { formLast3, fmtPct, earlyCallFor, fmtMult } from '../game/scoring';
import { LAST_COMPLETE_GW } from '../data/source';
import { Monogram } from './Monogram';
import { Delta, PosTag } from './bits';

export function PlayerRow({ player, inList }: { player: Player; inList?: boolean }) {
  const club = clubOf(player);
  const now = ownershipNow(player);
  const prev = ownershipAt(player, LAST_COMPLETE_GW - 1);
  const form = formLast3(player, LAST_COMPLETE_GW);
  return (
    <li>
      <Link to={`/player/${player.id}`} className="group grid grid-cols-[44px_1fr_auto] sm:grid-cols-[44px_1fr_80px_72px_96px] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-lg hover:bg-well transition-colors">
        <Monogram player={player} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold truncate">{player.name}</span>
            {inList && <span className="inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-graphite shrink-0"><Check size={14} strokeWidth={3} aria-hidden className="text-ink" />On your list</span>}
          </div>
          <div className="flex items-center gap-2 text-[14px] text-graphite min-w-0">
            <PosTag pos={player.position} /><span className="truncate">{club.name} · {player.age}</span>
          </div>
          {!inList && earlyCallFor(now) > 1 && <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-flare-tint px-2 py-0.5 text-[12px] font-semibold text-flare-ink">{fmtMult(earlyCallFor(now))} if you scout now</div>}
        </div>
        <div className="hidden sm:block"><Last5 values={player.weeks.slice(-5).map((w) => w.points)} /></div>
        <div className="hidden sm:block text-right">
          <div className="display text-[24px] num">{form}</div>
          <div className="text-[12px] text-graphite">last 3 GWs</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[15px] font-semibold num">{fmtPct(now)}</div>
          <div className="text-[12px]"><Delta value={now - prev} suffix="%" /></div>
        </div>
      </Link>
    </li>
  );
}

function Last5({ values }: { values: number[] }) {
  const max = 15;
  return (
    <span className="flex items-end gap-[3px] h-7" role="img" aria-label={`Last 5 gameweeks: ${values.join(', ')} points`}>
      {values.map((v, i) => <span key={i} className={v >= 10 ? 'w-2 rounded-[2px] bg-ink' : 'w-2 rounded-[2px] bg-flare'} style={{ height: `${Math.max(8, Math.min(1, v / max) * 100)}%`, opacity: v === 0 ? 0.25 : 1 }} />)}
    </span>
  );
}
