import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Receipt paper used as a surface: serrated bottom edge, mono details. The app's spine. */
export function Slip({ children, className, edge = 'bottom' }: { children: ReactNode; className?: string; edge?: 'bottom' | 'both' | 'none' }) {
  return (
    <div className={cn('relative', className)} style={{ filter: 'drop-shadow(0 1px 1px rgba(15,23,41,.06)) drop-shadow(0 8px 14px rgba(15,23,41,.08))' }}>
      <div className="receipt-paper" style={{ clipPath: edge === 'none' ? undefined : `polygon(${teeth(edge)})` }}>{children}</div>
    </div>
  );
}
function teeth(edge: 'bottom' | 'both') {
  const n = 40, h = 6, pts: string[] = [];
  if (edge === 'both') for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${i % 2 ? h : 0}px`);
  else pts.push('0 0', '100% 0');
  for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% calc(100% - ${i % 2 ? h : 0}px)`);
  return pts.join(',');
}
export const SlipRule = () => <div className="border-t border-dashed border-hairline" />;
