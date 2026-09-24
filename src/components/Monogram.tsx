import type { Player } from '../data/types';
import { clubOf } from '../data/pool';
import { cn } from '../lib/cn';

/** No player photos (image rights): a kit-coloured monogram instead. */
export function Monogram({ player, size = 44, className }: { player: Player; size?: number; className?: string }) {
  const club = clubOf(player);
  const [a, b] = club.colors;
  const initials = player.name.split(' ').map((s) => s[0]).join('');
  return (
    <span
      aria-hidden
      className={cn('relative inline-grid place-items-center shrink-0 rounded-full overflow-hidden display', className)}
      style={{ width: size, height: size, background: a, color: b, fontSize: size * 0.42, boxShadow: 'inset 0 0 0 1px rgba(15,23,41,.12)' }}
    >
      <span className="absolute inset-y-0 right-0 w-[18%]" style={{ background: b, opacity: 0.9 }} />
      <span className="relative -ml-[14%]">{initials}</span>
    </span>
  );
}
