import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink';
// design.md v2 §4: borders 1px, radius 6, 48px house height, no shadows on buttons.
const styles: Record<Variant, string> = {
  primary: 'btn-primary-grain bg-flare text-ink border border-ink hover:bg-[#FF6340] disabled:bg-well disabled:border-card-edge disabled:text-pencil',
  ink: 'bg-ink text-paper border border-ink hover:bg-[#252522] disabled:bg-well disabled:border-card-edge disabled:text-pencil',
  secondary: 'bg-transparent text-ink border border-ink hover:bg-ink/[0.06] disabled:border-card-edge disabled:text-pencil',
  ghost: 'text-graphite hover:text-ink disabled:text-pencil',
  danger: 'bg-transparent text-offside border border-ink hover:bg-ink/[0.06] disabled:border-card-edge disabled:text-pencil',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'md' | 'lg' | 'sm'; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', size = 'md', className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'press inline-flex items-center justify-center gap-2 rounded-md font-semibold select-none disabled:pointer-events-none whitespace-nowrap',
        size === 'lg' ? 'h-12 px-6 text-[17px]' : size === 'sm' ? 'min-h-11 px-3.5 text-sm' : 'h-12 px-5 text-[15px]',
        styles[variant], className,
      )}
      {...rest}
    />
  );
});
