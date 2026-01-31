
import { HorseRacingOpportunity, CalculatedEachWayOpportunity } from '../types';

interface EachWayProps {
  opportunity: HorseRacingOpportunity;
  totalStake: number;
  commission: number; // Commission rate as a percentage (e.g., 2 for 2%)
}

/**
 * Calculates all the stakes, liabilities, and outcomes for an each-way horse racing bet.
 * 
 * @param opportunity The horse racing opportunity details.
 * @param totalStake The total amount the user wants to stake on the bookmaker.
 * @param commission The Betfair commission rate.
 * @returns A detailed breakdown of the each-way calculation.
 */
export function calculateEachWay({ opportunity, totalStake, commission }: EachWayProps): CalculatedEachWayOpportunity {
  const { backOdds, layOdds, placeTerms } = opportunity;
  const commissionRate = commission / 100;

  // 1. Split the stake into two parts: one for the win, one for the place.
  const winBackStake = totalStake / 2;
  const placeBackStake = totalStake / 2;

  // 2. Calculate the lay stake for the WIN part of the bet.
  const winLayStake = (backOdds * winBackStake) / (layOdds - commissionRate);
  const winLiability = winLayStake * (layOdds - 1);
  const winLayProfit = winLayStake * (1 - commissionRate);
  
  // 3. Calculate the effective odds for the PLACE part of the bet.
  const placeOdds = 1 + (backOdds - 1) * placeTerms.fraction;
  // To calculate the implied place lay odds, we mirror the bookmaker's calculation.
  const placeLayOdds = 1 + (layOdds - 1) * placeTerms.fraction;

  // 4. Calculate the lay stake for the PLACE part of the bet.
  const placeLayStake = (placeOdds * placeBackStake) / (placeLayOdds - commissionRate);
  const placeLiability = placeLayStake * (placeLayOdds - 1);
  const placeLayProfit = placeLayStake * (1 - commissionRate);

  // 5. Calculate the three possible outcomes.

  // Scenario 1: The horse WINS.
  const profitIfWin = (winBackStake * (backOdds - 1)) + (placeBackStake * (placeOdds - 1)) - winLiability - placeLiability;

  // Scenario 2: The horse PLACES but does not win.
  const profitIfPlace = (placeBackStake * (placeOdds - 1)) - winBackStake + winLayProfit - placeLiability;

  // Scenario 3: The horse LOSES (does not place).
  const profitIfLose = winLayProfit + placeLayProfit - totalStake;

  return {
    calculationType: 'EachWay',
    opportunity,
    totalStake,
    winBackStake,
    winLayStake,
    winLiability,
    placeBackStake,
    placeLayStake,
    placeLiability,
    profitIfWin,
    profitIfPlace,
    profitIfLose,
  };
}
