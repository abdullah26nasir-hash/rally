import { pageview } from './lib/analytics';
import { AnalyticsConsent } from './components/AnalyticsConsent';
import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useGame } from './store';
import { Shell } from './components/Shell';
import { Welcome } from './screens/Welcome';
import { ThisWeek } from './screens/ThisWeek';
import { Scout } from './screens/Scout';
import { PlayerPage } from './screens/PlayerPage';
import { ListPage } from './screens/ListPage';
import { ReceiptPage } from './screens/ReceiptPage';
import { Leagues, LeagueDetail } from './screens/Leagues';
import { How } from './screens/How';
import { Start, Join } from './screens/Start';

export default function App() {
  const mode = useGame((s) => s.mode);
  return (
    <>
    <RouteFocus />
    <AnalyticsConsent />
    <Routes>
      {mode === 'new' && <Route path="/" element={<Welcome />} />}
      <Route path="/start" element={<Start />} />
      <Route path="/join/:code" element={<Join />} />
      <Route element={<Shell />}>
        {mode !== 'new' && <Route path="/" element={<ThisWeek />} />}
        <Route path="/scout" element={<Scout />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/leagues/:id" element={<LeagueDetail />} />
        <Route path="/how" element={<How />} />
        <Route path="*" element={<ThisWeek />} />
      </Route>
    </Routes>
    </>
  );
}

/** On client-side navigation, name the page and move focus to its heading so screen readers announce the new screen. */
function RouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const h1 = document.querySelector<HTMLElement>('h1');
      document.title = h1?.textContent ? `${h1.textContent} · Rally` : 'Rally';
      pageview();
      if (first.current) { first.current = false; return; }
      if (h1) { h1.tabIndex = -1; h1.style.outline = 'none'; h1.focus({ preventScroll: true }); }
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);
  return null;
}
