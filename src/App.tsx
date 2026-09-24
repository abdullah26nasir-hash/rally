import { Route, Routes } from 'react-router-dom';
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

export default function App() {
  const mode = useGame((s) => s.mode);
  return (
    <Routes>
      {mode === 'new' && <Route path="/" element={<Welcome />} />}
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
  );
}
