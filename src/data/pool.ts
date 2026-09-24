import { mulberry32, pick } from '../lib/rng';
import { weekPoints } from '../game/scoring';
import { LAST_COMPLETE_GW } from './season';
import type { Club, Player, Position, WeekStat } from './types';

// PREVIEW SEASON: every player and club here is fictional. No real person is given invented stats.
export const CLUBS: Club[] = [
  { id: 'kgm', name: 'Kingsmoor', short: 'KGM', league: 'Top flight', colors: ['#B3202A', '#FFFFFF'] },
  { id: 'hbt', name: 'Harbour Town', short: 'HBT', league: 'Top flight', colors: ['#12306B', '#8FC7FF'] },
  { id: 'ash', name: 'Ashbridge Utd', short: 'ASH', league: 'Top flight', colors: ['#111111', '#F2C230'] },
  { id: 'wvl', name: 'Wexvale', short: 'WVL', league: 'Top flight', colors: ['#5A1E6E', '#E7D7F0'] },
  { id: 'crn', name: 'Carnford City', short: 'CRN', league: 'Top flight', colors: ['#7DB9E8', '#0E2A47'] },
  { id: 'stm', name: 'St Marlow', short: 'STM', league: 'Top flight', colors: ['#1B6B3A', '#FFFFFF'] },
  { id: 'dnh', name: 'Dunholme Rovers', short: 'DNH', league: 'Second tier', colors: ['#0A5A9C', '#FFFFFF'] },
  { id: 'brk', name: 'Brakeley', short: 'BRK', league: 'Second tier', colors: ['#E0661F', '#1A1A1A'] },
  { id: 'tlw', name: 'Tollworth Albion', short: 'TLW', league: 'Second tier', colors: ['#FFFFFF', '#1D2B64'] },
  { id: 'rvs', name: 'Riverside Athletic', short: 'RVS', league: 'Second tier', colors: ['#C8102E', '#0B1F3A'] },
  { id: 'fnb', name: 'Fenbury', short: 'FNB', league: 'Second tier', colors: ['#F5D130', '#1F4E2C'] },
  { id: 'mcl', name: 'Millcross', short: 'MCL', league: 'Third tier', colors: ['#6E0F1A', '#86C5DA'] },
  { id: 'ptw', name: 'Portwick', short: 'PTW', league: 'Third tier', colors: ['#000000', '#FFFFFF'] },
  { id: 'glh', name: 'Glenhurst', short: 'GLH', league: 'Third tier', colors: ['#3A7D44', '#F4E04D'] },
];

const FIRST = ['Kai', 'Tobi', 'Rio', 'Callum', 'Jayden', 'Idris', 'Mateo', 'Owen', 'Dara', 'Kian', 'Luca', 'Remi', 'Ezra', 'Samir', 'Theo', 'Malik', 'Finn', 'Arlo', 'Kofi', 'Niall', 'Yusuf', 'Rhys', 'Jude', 'Ibrahim', 'Leon', 'Mason', 'Andre', 'Tariq', 'Cole', 'Elijah', 'Nico', 'Declan', 'Zane', 'Musa', 'Harvey', 'Ronan', 'Olly', 'Kacper', 'Davi', 'Femi', 'Louie', 'Ashton', 'Bilal', 'Marcus', 'Jonah', 'Aaron', 'Stefan', 'Ruben'];
const LAST = ['Adeyemi', 'Hartley', 'Okafor', 'Brennan', 'Castell', 'Mensah', 'Whitlock', 'Duarte', 'Ferris', 'Nwosu', 'Lindqvist', 'Ashworth', 'Boateng', 'Quinlan', 'Varga', 'Pryce', 'Osei', 'Kerrigan', 'Maddox', 'Sowande', 'Tennant', 'Rahman', 'Delacroix', 'Holt', 'Achterberg', 'Marsh', 'Oyelaran', 'Sinclair', 'Kowalski', 'Bright', 'Fairweather', 'Danso', 'Ellery', 'Morrow', 'Ikeme', 'Carvalho', 'Stroud', 'Afolabi', 'Rourke', 'Galloway', 'Mbeki', 'Thornton', 'Yilmaz', 'Doherty', 'Keane', 'Asante', 'Wren', 'Byfield', 'Aldridge', 'Bamford', 'Chukwu', 'Dunmore', 'Eastwood', 'Fofana', 'Gately', 'Hendry', 'Irwin', 'Jalloh', 'Kavanagh', 'Lomax', 'McAteer', 'Nkemelu', 'Ogbonna', 'Pennock', 'Quarshie', 'Redfern', 'Sallah', 'Treacy', 'Umeh', 'Vickers', 'Wardle', 'Yeboah', 'Zielinski', 'Abara', 'Blackwood', 'Coyle', 'Dervish', 'Eke', 'Fielding', 'Gyasi', 'Hollis', 'Iheanacho', 'Jarvis', 'Kamara', 'Lusk', 'Mulholland', 'Nuttall', 'Oduya', 'Pickard', 'Rafferty', 'Stanhope', 'Tiernan', 'Uddin', 'Vance', 'Westbrook', 'Achebe', 'Barrow', 'Cairns', 'Dacosta', 'Egan', 'Forde', 'Garvey', 'Hurst', 'Innes', 'Joyce', 'Kinsella', 'Lawal', 'Marriott', 'Njie', 'Oldfield', 'Parris', 'Rowe', 'Sesay', 'Tobin', 'Vieira-Hall', 'Whelan', 'Ayling', 'Bassey', 'Cardoso', 'Dunne', 'Enobakhare', 'Farrant', 'Goode', 'Halloran', 'Ingram', 'Jobe'];
const NATIONS = ['ENG', 'ENG', 'ENG', 'ENG', 'SCO', 'WAL', 'IRL', 'NIR', 'FRA', 'NED', 'POR', 'GHA', 'NGA', 'ESP', 'POL', 'JAM', 'SWE', 'BEL'];
const ROLES: Record<Position, string[]> = {
  GK: ['Goalkeeper'],
  DEF: ['Centre-back', 'Right-back', 'Left-back', 'Wing-back'],
  MID: ['Defensive mid', 'Central mid', 'Attacking mid', 'Winger'],
  FWD: ['Striker', 'Second striker', 'Inside forward'],
};

type Arc = 'breakout' | 'riser' | 'steady' | 'quiet' | 'fading';

function build(): Player[] {
  const r = mulberry32(20260815);
  const players: Player[] = [];
  const surnames = [...new Set(LAST)];
  for (let i = surnames.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [surnames[i], surnames[j]] = [surnames[j], surnames[i]]; }
  const positions: Position[] = [];
  for (let i = 0; i < 12; i++) positions.push('GK');
  for (let i = 0; i < 40; i++) positions.push('DEF');
  for (let i = 0; i < 44; i++) positions.push('MID');
  for (let i = 0; i < 30; i++) positions.push('FWD');

  positions.forEach((position, i) => {
    const name = `${FIRST[(i * 17 + Math.floor(r() * 5)) % FIRST.length]} ${surnames[i % surnames.length]}`;
    const club = CLUBS[i % CLUBS.length];
    const roll = r();
    const arc: Arc = roll < 0.08 ? 'breakout' : roll < 0.22 ? 'riser' : roll < 0.62 ? 'steady' : roll < 0.9 ? 'quiet' : 'fading';
    const age = 17 + Math.floor(r() * 5); // 17-21
    const tierBoost = club.league === 'Top flight' ? 0.9 : club.league === 'Second tier' ? 1.05 : 1.15;

    const weeks: WeekStat[] = [];
    for (let gw = 1; gw <= LAST_COMPLETE_GW; gw++) {
      const progress = gw / LAST_COMPLETE_GW;
      const playChance = { breakout: 0.35 + progress * 0.65, riser: 0.55 + progress * 0.3, steady: 0.8, quiet: 0.35, fading: 0.9 - progress * 0.6 }[arc];
      const plays = r() < playChance;
      const minutes = plays ? (r() < (arc === 'quiet' ? 0.4 : 0.75) ? 60 + Math.floor(r() * 31) : 10 + Math.floor(r() * 45)) : 0;
      const threat = { breakout: 0.25 + progress * 0.45, riser: 0.28, steady: 0.18, quiet: 0.08, fading: 0.12 }[arc] * tierBoost;
      const goalBias = position === 'FWD' ? 1.3 : position === 'MID' ? 0.8 : position === 'DEF' ? 0.25 : 0;
      const goals = minutes ? (r() < threat * goalBias ? (r() < 0.2 ? 2 : 1) : 0) : 0;
      const assists = minutes && position !== 'GK' ? (r() < threat * 0.7 ? 1 : 0) : 0;
      const cleanSheet = minutes >= 60 && r() < 0.32;
      let moment: WeekStat['moment'];
      if (arc === 'breakout' && minutes && !weeks.some((w) => w.moment === 'Senior debut') && gw >= 2 && r() < 0.5) moment = 'Senior debut';
      else if (arc === 'breakout' && gw === 6 && r() < 0.5) moment = 'First call-up';
      const base = { gw, minutes, goals, assists, cleanSheet, moment };
      weeks.push({ ...base, points: weekPoints(position, base) });
    }

    // ownership curve (% of scouts)
    const start = { breakout: 0.3 + r() * 1.2, riser: 1 + r() * 3, steady: 3 + r() * 8, quiet: 0.2 + r() * 1.5, fading: 8 + r() * 12 }[arc];
    const end = { breakout: 18 + r() * 30, riser: 6 + r() * 10, steady: start * (0.8 + r() * 0.6), quiet: start * (0.7 + r() * 0.8), fading: start * 0.35 }[arc];
    const ownership: number[] = [];
    for (let gw = 0; gw <= LAST_COMPLETE_GW; gw++) {
      const t = gw / LAST_COMPLETE_GW;
      const curve = arc === 'breakout' ? Math.pow(t, 2.4) : t;
      const noise = 1 + (r() - 0.5) * 0.08;
      ownership.push(Math.max(0.1, (start + (end - start) * curve) * noise));
    }

    players.push({
      id: `p${(i + 1).toString().padStart(3, '0')}`,
      name, age, position, role: pick(r, ROLES[position]), clubId: club.id, nation: pick(r, NATIONS), weeks, ownership,
    });
  });
  return players;
}

export const PLAYERS: Player[] = build();
export const playerById = new Map(PLAYERS.map((p) => [p.id, p]));
export const clubById = new Map(CLUBS.map((c) => [c.id, c]));
export const clubOf = (p: Player) => clubById.get(p.clubId)!;
export const ownershipNow = (p: Player) => p.ownership[p.ownership.length - 1];
export const ownershipAt = (p: Player, gwEnd: number) => p.ownership[Math.max(0, Math.min(gwEnd, p.ownership.length - 1))];
