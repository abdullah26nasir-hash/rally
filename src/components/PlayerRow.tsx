import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { Player } from '../data/types';
import { clubOf, ownershipNow, ownershipAt } from '../data/pool';
import { formLast3, fmtPct } from '../game/scoring';
import { LAST_COMPLETE_GW } from '../data/season';
import { Monogram } from './Monogram';
import { Sparkline } from './Sparkline';
import { Delta, PosTag } from './bits';

export function PlayerRow({ player, inList }: { player: Player; inList?: boolean }) {
  const club = clubOf(player);
  const now = ownershipNow(player);
  const prev = ownershipAt(player, LAST_COMPLETE_GW - 1);
  const form = formLast3(player, LAST_COMPLETE_GW);
  return (
    <li>
      <Link to={`/player/${player.id}`} className="group grid grid-cols-[44px_1fr_auto] sm:grid-cols-[44px_1fr_80px_72px_96px] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-[12px] hover:bg-biro-wash/60 transition-colors">
        <Monogram player={player} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold truncate">{player.name}</span>
            {inList && <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-biro shrink-0"><Check size={14} strokeWidth={3} aria-hidden />On your list</span>}
          </div>
          <div className="flex items-center gap-2 text-[14px] text-graphite min-w-0">
            <PosTag pos={player.position} /><span className="truncate">{club.name} · {player.age}</span>
          </div>
        </div>
        <div className="hidden sm:block text-biro"><Sparkline values={player.weeks.map((w) => w.points)} label={`Points per gameweek: ${player.weeks.map((w) => w.points).join(', ')}`} /></div>
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
