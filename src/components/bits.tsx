import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../lib/cn';

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('font-mono text-[12px] uppercase tracking-[0.08em] text-graphite', className)}>{children}</div>
);

export const Card = ({ children, className, as: As = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' }) => (
  <As className={cn('bg-paper rounded-lg border border-card-edge', className)}>{children}</As>
);

export function Delta({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  if (Math.abs(value) < 0.05) return <span className={cn('text-graphite num', className)}>no change</span>;
  const up = value > 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 num font-semibold', up ? 'text-match' : 'text-offside', className)}>
      {up ? <ArrowUp size={14} strokeWidth={2.6} aria-hidden /> : <ArrowDown size={14} strokeWidth={2.6} aria-hidden />}
      <span className="sr-only">{up ? 'up' : 'down'}</span>
      {Math.abs(value).toLocaleString('en-GB', { maximumFractionDigits: 1 })}{suffix}
    </span>
  );
}

export const PosTag = ({ pos }: { pos: string }) => (
  <span className="inline-grid place-items-center h-5 min-w-9 px-1.5 rounded-[5px] bg-ink/[0.06] font-mono text-[11px] font-semibold text-ink">{pos}</span>
);

export function PageTitle({ eyebrow, title, children }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 lg:mb-8">
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <h1 className="display text-[40px] lg:text-[56px]">{title}</h1>
      {children && <div className="mt-2 text-graphite max-w-[60ch]">{children}</div>}
    </div>
  );
}
