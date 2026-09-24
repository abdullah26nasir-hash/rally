import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink';
const styles: Record<Variant, string> = {
  primary: 'bg-biro text-white hover:bg-biro-deep shadow-sm',
  ink: 'bg-ink text-white hover:bg-ink/90',
  secondary: 'bg-card text-ink shadow-sm hover:bg-biro-wash',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-card text-stamp-deep shadow-sm hover:bg-stamp/5',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: 'md' | 'lg' | 'sm'; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', size = 'md', className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        'press inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold select-none disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap',
        size === 'lg' ? 'h-13 px-6 text-[17px]' : size === 'sm' ? 'min-h-11 px-3.5 text-sm' : 'h-11 px-4.5 text-[15px]',
        styles[variant], className,
      )}
      {...rest}
    />
  );
});
