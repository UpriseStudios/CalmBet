
// Defines the shape of all data structures used in the CalmBet app.

// --- Core Types ---

export type Sport = 'Football' | 'HorseRacing';

export type Bookmaker = 'bet365' | 'skybet' | 'williamhill' | 'paddypower' | 'ladbrokes';

export interface Anomaly {
  type: 'boost' | 'liquidity' | 'margin';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// --- Opportunity Types (Discriminated Union) ---

// The core Opportunity type is a union of all sport-specific opportunities.
// The `sport` property acts as the discriminant.
export type Opportunity = FootballOpportunity | HorseRacingOpportunity;

export interface FootballOpportunity {
  sport: 'Football';
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
  anomaly?: Anomaly;
}

export interface HorseRacingOpportunity {
  sport: 'HorseRacing';
  id: string;
  eventName: string; // e.g., "15:30 Ascot"
  horseName: string;
  kickoff: Date;
  bookmaker: Bookmaker;
  backOdds: number;
  layOdds: number;
  liquidity: number;
  betfairMarketId: string;
  placeTerms: {
    fraction: number; // e.g., 0.25 for 1/4
    places: number;
  };
  anomaly?: Anomaly;
}

// --- Calculated Opportunity Types ---

// A union of all possible calculation results.
export type CalculatedOpportunity = 
  | CalculatedStandardOpportunity
  | CalculatedEachWayOpportunity;

// For standard bets (Football or Horse Racing win-only)
export interface CalculatedStandardOpportunity {
  calculationType: 'Standard';
  opportunity: Opportunity; // The original opportunity data
  backStake: number;
  layStake: number;
  liability: number;
  profit: number;
  qualifyingLoss: number;
}

// For each-way horse racing bets
export interface CalculatedEachWayOpportunity {
  calculationType: 'EachWay';
  opportunity: HorseRacingOpportunity; // Each-way is only for horse racing
  totalStake: number;
  // Win part of the bet
  winBackStake: number;
  winLayStake: number;
  winLiability: number;
  // Place part of the bet
  placeBackStake: number;
  placeLayStake: number;
  placeLiability: number;
  // Final profit/loss scenarios
  profitIfWin: number;
  profitIfPlace: number;
  profitIfLose: number;
}


// --- User and Session Types ---

export interface CompletedOpportunity extends CalculatedOpportunity {
  completedAt: Date;
  status: 'done' | 'odds_changed' | 'not_available';
}

export interface UserSettings {
  defaultBackStake: number;
  commission: number;
  minLiquidity: number;
  maxQualifyingLoss: number;
  sportPreference: Sport;
}

export enum NudgeType {
  Session = 'session',
  LateNight = 'late_night',
  StakeLimit = 'stake_limit',
  DailyLimit = 'daily_limit',
  SelfExclusion = 'self_exclusion',
}


// --- Constants ---

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
  sportPreference: 'Football',
};
