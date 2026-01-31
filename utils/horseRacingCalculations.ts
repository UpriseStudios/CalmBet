
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
  // For the place part, the lay odds are often different. For this simulation,
  // we will assume a simplified lay odds scenario for the place market.
  // A real app would need a separate place market lay odds.
  const placeLayOdds = (placeOdds / (1 + 0.05)); // Assuming place lay is 5% worse than implied

  // 4. Calculate the lay stake for the PLACE part of the bet.
  const placeLayStake = (placeOdds * placeBackStake) / (placeLayOdds - commissionRate);
  const placeLiability = placeLayStake * (placeLayOdds - 1);
  const placeLayProfit = placeLayStake * (1 - commissionRate);

  // 5. Calculate the three possible outcomes.

  // Scenario 1: The horse WINS.
  // - Win part of back bet wins.
  // - Place part of back bet wins.
  // - Both lay bets lose (we pay the liability).
  const profitIfWin = (winBackStake * (backOdds - 1)) + (placeBackStake * (placeOdds - 1)) - winLiability - placeLiability;

  // Scenario 2: The horse PLACES but does not win.
  // - Win part of back bet loses.
  // - Place part of back bet wins.
  // - Win lay bet wins.
  // - Place lay bet loses.
  const profitIfPlace = (placeBackStake * (placeOdds - 1)) + winLayProfit - placeLiability - winBackStake;

  // Scenario 3: The horse LOSES (does not place).
  // - Both parts of back bet lose.
  // - Both lay bets win.
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
