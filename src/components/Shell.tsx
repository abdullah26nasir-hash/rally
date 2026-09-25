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

const TITLES: Array<[RegExp, string]> = [
  [/^\/$/, 'This week'], [/^\/scout/, 'Scout'], [/^\/list/, 'Your list'], [/^\/leagues/, 'Leagues'],
  [/^\/how/, 'How scoring works'], [/^\/start/, 'Get started'], [/^\/player/, 'Scouting report'], [/^\/receipt/, 'Receipt'], [/^\/join/, 'Join league'],
];

export function Shell() {
  const { pathname } = useLocation();
  const title = (TITLES.find(([re]) => re.test(pathname)) || [])[1] || 'This week';
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    const header = document.getElementById('stub-header');
    const tabbar = document.getElementById('tab-bar');
    const top = document.getElementById('scroll-sentinel-top');
    const bottom = document.getElementById('scroll-sentinel-bottom');
    if (!top || !bottom) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.target === top && header) header.classList.toggle('shadow-md', !e.isIntersecting);
        if (e.target === bottom && tabbar) tabbar.classList.toggle('tabbar-shadow', !e.isIntersecting);
      });
    });
    io.observe(top); io.observe(bottom);
    return () => io.disconnect();
  }, [pathname]);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-paper focus:px-4 focus:py-3 focus:rounded-lg focus:shadow-md">Skip to content</a>
      {/* desktop rail */}
      <aside className="hidden lg:flex flex-col sticky top-0 h-dvh border-r border-hairline px-4 py-6 bg-paper">
        <Wordmark />
        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex items-center gap-3 h-11 px-3 rounded-lg font-medium transition-colors', isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/5')}>
              <Icon size={19} strokeWidth={2} aria-hidden />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <PreviewTag />
          <NavLink to="/how" className="inline-flex items-center min-h-11 mt-1 text-sm text-graphite hover:text-ink underline-offset-4 hover:underline">How scoring works</NavLink>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        {/* mobile top bar */}
        <header id="stub-header" className="lg:hidden sticky top-0 z-30 bg-stub text-paper pt-safe px-safe">
          <div className="flex items-center justify-between h-14 px-4">
            <NavLink to="/" className="flex items-center gap-2.5 min-h-11 -ml-1 px-1" aria-label="Rallycademy home">
              <svg viewBox="0 0 64 64" width="24" height="24" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M10 8H33C45.1 8 52 14.4 52 24.8C52 32.7 47.7 38 40.6 40.6L54 56H41.4L30.6 42.7H24V52H23V56H20V52H18V56H15V52H13V56H10V8ZM24 18V31H32.5C37.4 31 40 28.8 40 24.5C40 20.3 37.3 18 32.5 18H24Z"/></svg>
              <span className="font-semibold text-[16px]">{title}</span>
            </NavLink>
            <NavLink to="/how" className="inline-flex min-h-11 items-center font-mono text-[11px] tracking-[0.06em] uppercase text-paper/75" aria-label="Preview season. How scoring works">WK 6 · Preview</NavLink>
          </div>
        </header>
        <div id="scroll-sentinel-top" aria-hidden className="h-px" /><main id="main" tabIndex={-1} className="outline-none flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 lg:pt-10 pb-28 lg:pb-16">
          <Outlet />
        </main><div id="scroll-sentinel-bottom" aria-hidden className="h-px" />
      </div>

      {/* mobile tab bar */}
      <nav id="tab-bar" aria-label="Main" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-hairline pb-safe px-safe">
        <div className="grid grid-cols-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex flex-col items-center justify-center gap-0.5 h-16 text-[12px] font-medium', isActive ? 'text-ink' : 'text-graphite')}>
              {({ isActive }) => (<>
                <span className={cn('grid place-items-center h-7 w-12 rounded-full transition-colors', isActive && 'bg-well')}><Icon size={20} strokeWidth={isActive ? 2.4 : 2} aria-hidden /></span>
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
    <NavLink to="/" className="inline-flex min-h-11 items-center gap-2" aria-label="Rallycademy home">
      <span className="flex items-center gap-2.5">
        <svg viewBox="0 0 64 64" width="26" height="26" aria-hidden="true"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M10 8H33C45.1 8 52 14.4 52 24.8C52 32.7 47.7 38 40.6 40.6L54 56H41.4L30.6 42.7H24V52H23V56H20V52H18V56H15V52H13V56H10V8ZM24 18V31H32.5C37.4 31 40 28.8 40 24.5C40 20.3 37.3 18 32.5 18H24Z"/></svg>
        <span className="display text-[clamp(16px,5vw,24px)] leading-none tracking-tight whitespace-nowrap">RALLYCADEMY</span>
      </span>
    </NavLink>
  );
}

function PreviewTag({ compact, onStub }: { compact?: boolean; onStub?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-mono', onStub ? 'border-paper/30 text-paper' : 'border-card-edge bg-paper text-graphite')} title="Players, clubs and results in this preview are fictional">
      <span className="h-1.5 w-1.5 rounded-full bg-flare" aria-hidden />
      {compact ? 'Preview season' : `Preview season ${SEASON}`}
    </span>
  );
}
