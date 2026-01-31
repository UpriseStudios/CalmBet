
import { Opportunity, CompletedOpportunity } from '@/types';

// --- Time Helper Functions ---
const now = new Date();
const addHours = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000);
const addMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60 * 1000);

// --- Mock Opportunity Data ---
// This array now includes both Football and Horse Racing opportunities.
export const mockOpportunities: Opportunity[] = [
  // Football Opportunities
  {
    sport: 'Football',
    id: '1',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    competition: 'Premier League',
    kickoff: addMinutes(45),
    bookmaker: 'bet365',
    backOdds: 2.10,
    layOdds: 2.12,
    liquidity: 3420,
    betfairMarketId: '1.123456',
  },
  // Horse Racing Opportunity (with Anomaly)
  {
    sport: 'HorseRacing',
    id: 'hr1',
    eventName: '14:30 Ascot',
    horseName: 'Lightning Lad',
    kickoff: addMinutes(90),
    bookmaker: 'skybet',
    backOdds: 4.5,
    layOdds: 4.6,
    liquidity: 1890,
    betfairMarketId: '1.987654',
    placeTerms: { fraction: 0.25, places: 3 }, // 1/4 odds, 3 places
    anomaly: {
      type: 'boost',
      severity: 'medium',
      description: 'Sky Bet Super Boost',
    },
  },
  {
    sport: 'Football',
    id: '2',
    homeTeam: 'Man United',
    awayTeam: 'Liverpool',
    competition: 'Premier League',
    kickoff: addHours(2),
    bookmaker: 'skybet',
    backOdds: 3.50,
    layOdds: 3.55,
    liquidity: 2180,
    betfairMarketId: '1.123457',
  },
  // Another Horse Racing Opportunity
  {
    sport: 'HorseRacing',
    id: 'hr2',
    eventName: '15:00 Newmarket',
    horseName: 'Galloping Gold',
    kickoff: addHours(2.5),
    bookmaker: 'paddypower',
    backOdds: 8.0,
    layOdds: 8.2,
    liquidity: 950,
    betfairMarketId: '1.987655',
    placeTerms: { fraction: 0.2, places: 4 }, // 1/5 odds, 4 places
  },
  {
    sport: 'Football',
    id: '3',
    homeTeam: 'Tottenham',
    awayTeam: 'Newcastle',
    competition: 'Premier League',
    kickoff: addHours(3),
    bookmaker: 'williamhill',
    backOdds: 1.85,
    layOdds: 1.87,
    liquidity: 4560,
    betfairMarketId: '1.123458',
  },
  {
    sport: 'Football',
    id: '4',
    homeTeam: 'Everton',
    awayTeam: 'West Ham',
    competition: 'Premier League',
    kickoff: addHours(4),
    bookmaker: 'paddypower',
    backOdds: 2.60,
    layOdds: 2.64,
    liquidity: 1890,
    betfairMarketId: '1.123459',
  },
];

// --- Mock Completed Opportunity Data (Unchanged for now) ---

const pastHours = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

// NOTE: The CompletedOpportunity type will also need to be updated to a discriminated union
// in a future step to properly handle completed horse racing bets.
export const mockCompletedOpportunities = [
  {
    id: 'c1',
    // ... (rest of the completed mock data is unchanged)
  },
];
