import { Goal, HandHelping, ShieldCheck, Sparkle, Clock3 } from 'lucide-react';
import type { WeekStat } from '../data/types';

/** Match events as small icons; the full sentence stays available to screen readers. */
export function EventIcons({ w }: { w: WeekStat }) {
  if (!w.minutes) return <span className="text-graphite">Did not play</span>;
  const items: Array<{ icon: typeof Goal; label: string; n?: number; tone?: string }> = [];
  for (let i = 0; i < w.goals; i++) items.push({ icon: Goal, label: 'goal' });
  for (let i = 0; i < w.assists; i++) items.push({ icon: HandHelping, label: 'assist' });
  if (w.cleanSheet && w.minutes >= 60) items.push({ icon: ShieldCheck, label: 'clean sheet' });
  if (w.moment) items.push({ icon: Sparkle, label: w.moment.toLowerCase(), tone: 'text-flare-ink' });
  const sentence = [`${w.minutes} minutes`, ...items.map((x) => x.label)].join(', ');
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0" title={sentence}>
      <span className="sr-only">{sentence}</span>
      <span aria-hidden className="inline-flex items-center gap-0.5 font-mono text-[12px] text-graphite"><Clock3 size={12} />{w.minutes}'</span>
      {items.map((x, i) => <x.icon key={i} aria-hidden size={15} strokeWidth={2.2} className={x.tone ?? 'text-ink'} />)}
      {w.moment && <span aria-hidden className="text-[12px] font-semibold text-flare-ink truncate">{w.moment}</span>}
    </span>
  );
}
