import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, Search, ListChecks, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../lib/cn';
import { SEASON } from '../data/source';

const NAV = [
  { to: '/', label: 'This week', icon: CalendarDays, end: true },
  { to: '/scout', label: 'Scout', icon: Search },
  { to: '/list', label: 'Your list', icon: ListChecks },
  { to: '/leagues', label: 'Leagues', icon: Trophy },
];

export function Shell() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:px-4 focus:py-3 focus:rounded-[10px] focus:shadow-md">Skip to content</a>
      {/* desktop rail */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-dvh border-r border-rule px-4 py-6 bg-paper">
        <Wordmark />
        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex items-center gap-3 h-11 px-3 rounded-[10px] font-medium transition-colors', isActive ? 'bg-ink text-white' : 'text-ink hover:bg-ink/5')}>
              <Icon size={19} strokeWidth={2} aria-hidden />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <PreviewTag />
          <NavLink to="/how" className="block mt-3 text-sm text-graphite hover:text-ink underline-offset-4 hover:underline">How scoring works</NavLink>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        {/* mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-rule pt-safe px-safe">
          <div className="flex items-center justify-between h-14 px-4">
            <Wordmark />
            <NavLink to="/how" className="inline-flex min-h-11 items-center" aria-label="Preview season. How scoring works"><PreviewTag compact /></NavLink>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="outline-none flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 lg:pt-10 pb-28 lg:pb-16">
          <Outlet />
        </main>
      </div>

      {/* mobile tab bar */}
      <nav aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/90 backdrop-blur-md border-t border-rule pb-safe px-safe">
        <div className="grid grid-cols-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center justify-center gap-0.5 h-16 text-[12px] font-medium', isActive ? 'text-biro' : 'text-graphite')}>
              {({ isActive }) => (<>
                <span className={cn('grid place-items-center h-7 w-12 rounded-full transition-colors', isActive && 'bg-biro-wash')}><Icon size={20} strokeWidth={isActive ? 2.4 : 2} aria-hidden /></span>
                {label}
              </>)}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Wordmark() {
  return (
    <NavLink to="/" className="inline-flex min-h-11 items-center gap-2" aria-label="Rally home">
      <span className="display text-[28px] leading-none tracking-tight">RALLY</span>
      <span className="h-2 w-6 rounded-sm bg-highlighter mt-2" aria-hidden />
    </NavLink>
  );
}

function PreviewTag({ compact }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-card px-2.5 py-1 text-[12px] text-graphite font-mono" title="Players, clubs and results in this preview are fictional">
      <span className="h-1.5 w-1.5 rounded-full bg-stamp" aria-hidden />
      {compact ? 'Preview season' : `Preview season ${SEASON}`}
    </span>
  );
}
