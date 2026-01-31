export type Bookmaker = 'bet365' | 'skybet' | 'williamhill' | 'paddypower' | 'ladbrokes';

export interface Opportunity {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  kickoff: Date;
  bookmaker: Bookmaker;
  backOdds: number;
  layOdds: number;
  liquidity: number;
  betfairMarketId: string;
  matchConfidence: number;
}

export interface CalculatedOpportunity extends Opportunity {
  backStake: number;
  layStake: number;
  liability: number;
  profitIfWin: number;
  profitIfLose: number;
  isArb: boolean;
  qualifyingLoss: number;
}

export interface CompletedOpportunity extends CalculatedOpportunity {
  completedAt: Date;
  status: 'done' | 'odds_changed' | 'not_available';
  actualBackOdds?: number;
  actualLayOdds?: number;
}

export interface UserSettings {
  defaultBackStake: number;
  commission: number;
  minLiquidity: number;
  maxQualifyingLoss: number;
  maxStakePerBet: number;
  maxDailyStake: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  sessionNudgeThreshold: number;
}

export interface SessionStats {
  actionsToday: number;
  todayStake: number;
  currentSessionActions: number;
  sessionStartTime: Date | null;
  lastActionTime: Date | null;
}

export const BOOKMAKER_NAMES: Record<Bookmaker, string> = {
  bet365: 'Bet365',
  skybet: 'Sky Bet',
  williamhill: 'William Hill',
  paddypower: 'Paddy Power',
  ladbrokes: 'Ladbrokes',
};

export const DEFAULT_SETTINGS: UserSettings = {
  defaultBackStake: 10,
  commission: 2,
  minLiquidity: 200,
  maxQualifyingLoss: -1,
  maxStakePerBet: 50,
  maxDailyStake: 500,
  quietHoursEnabled: true,
  quietHoursStart: '23:30',
  quietHoursEnd: '07:00',
  sessionNudgeThreshold: 5,
};
