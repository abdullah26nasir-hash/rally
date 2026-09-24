import type { Player } from '../data/types';
import { clubOf } from '../data/pool';
import { cn } from '../lib/cn';

export const shirtNumber = (p: Player) => {
  const base = { GK: [1, 13, 25], DEF: [2, 3, 4, 5, 6, 12, 15, 22], MID: [8, 10, 14, 16, 17, 18, 20, 23], FWD: [7, 9, 11, 19, 21, 29] }[p.position];
  return base[parseInt(p.id.slice(1), 10) % base.length];
};

/** No player photos (image rights): the club shirt with his number instead. */
export function Monogram({ player, size = 44, className }: { player: Player; size?: number; className?: string }) {
  const [a, b] = clubOf(player).colors;
  const light = (hex: string) => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150; };
  const numColor = light(a) ? '#0F1729' : light(b) ? b : '#FFFFFF';
  return (
    <span aria-hidden className={cn('relative inline-grid place-items-center shrink-0 rounded-full bg-ink/[0.05]', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size * 0.82} height={size * 0.82}>
        <path d="M13 5 L8 7 L2 13 L6 19 L9 17 L9 36 L31 36 L31 17 L34 19 L38 13 L32 7 L27 5 C26 8 23.5 9.5 20 9.5 C16.5 9.5 14 8 13 5 Z" fill={a} stroke="rgba(15,23,41,.28)" strokeWidth="1" strokeLinejoin="round" />
        <path d="M13 5 C14 8 16.5 9.5 20 9.5 C23.5 9.5 26 8 27 5" fill="none" stroke={b} strokeWidth="2.2" />
        <path d="M2 13 L6 19 L9 17 L8.2 11.6 Z M38 13 L34 19 L31 17 L31.8 11.6 Z" fill={b} opacity="0.9" />
        <text x="20" y="29" textAnchor="middle" fontFamily="Big Shoulders Display Variable, sans-serif" fontWeight="800" fontSize="15" fill={numColor}>{shirtNumber(player)}</text>
      </svg>
    </span>
  );
}
