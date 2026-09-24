import { levelFor, LEVELS, type Stamp } from '../game/stamps';

export function LevelBar({ stamps, compact }: { stamps: Stamp[]; compact?: boolean }) {
  const lv = levelFor(stamps);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-graphite">Scout level {lv.level} of {LEVELS.length}</div>
          <div className={compact ? 'display text-[26px] mt-0.5' : 'display text-[34px] mt-0.5'}>{lv.name}</div>
        </div>
        <div className="font-mono text-[13px] text-graphite shrink-0 num">{lv.xp} XP</div>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-rule overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)} aria-label={`Progress to ${lv.next?.name ?? 'top level'}`}>
        <div className="h-full rounded-full bg-biro" style={{ width: `${Math.max(4, lv.progress * 100)}%` }} />
      </div>
      <div className="mt-1.5 text-[13px] text-graphite">{lv.next ? `${lv.toNext} XP to ${lv.next.name}` : 'Top of the ladder'}</div>
    </div>
  );
}
