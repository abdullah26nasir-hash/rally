import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink';
const styles: Record<Variant, string> = {
  primary: 'bg-flare text-ink hover:bg-flare-deep shadow-sm',
  ink: 'bg-paper text-ink hover:bg-paper/90',
  secondary: 'bg-surface-1 text-paper shadow-sm hover:bg-flare-wash',
  ghost: 'text-paper hover:bg-paper/5',
  danger: 'bg-surface-1 text-flare shadow-sm hover:bg-flare/10',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'md' | 'lg' | 'sm'; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', size = 'md', className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'press inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold select-none disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap',
        size === 'lg' ? 'h-13 px-6 text-[17px]' : size === 'sm' ? 'min-h-11 px-3.5 text-sm' : 'h-11 px-4.5 text-[15px]',
        styles[variant], className,
      )}
      {...rest}
    />
  );
});
