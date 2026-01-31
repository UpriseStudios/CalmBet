
import { 
  Opportunity, 
  CalculatedStandardOpportunity,
  CalculatedOpportunity,
  HorseRacingOpportunity,
} from '@/types';
import { calculateEachWay } from './horseRacingCalculations';

// --- Main Calculation Entry Point ---

interface CalculateProps {
  opportunity: Opportunity;
  stake: number;
  commission: number;
  isEachWay?: boolean; // Optional flag for horse racing
}

/**
 * A unified function to calculate bet outcomes for any sport.
 * It acts as a router, directing the calculation to the correct logic
 * based on the sport and whether the bet is each-way.
 *
 * @returns A CalculatedOpportunity object, either Standard or EachWay.
 */
export function calculate({
  opportunity,
  stake,
  commission,
  isEachWay = false,
}: CalculateProps): CalculatedOpportunity {
  switch (opportunity.sport) {
    case 'Football':
      // Football bets are always standard.
      return calculateStandard({ opportunity, stake, commission });

    case 'HorseRacing':
      // Horse racing can be standard (win-only) or each-way.
      if (isEachWay) {
        // We need to assert the type here for the each-way calculation
        return calculateEachWay({
          opportunity: opportunity as HorseRacingOpportunity,
          totalStake: stake,
          commission,
        });
      } else {
        return calculateStandard({ opportunity, stake, commission });
      }

    default:
      // This should never be reached if all sports are handled.
      throw new Error(`Unsupported sport: ${(opportunity as any).sport}`);
  }
}

// --- Specific Calculation Implementations ---

/**
 * Calculates the outcome for a standard "back and lay" bet.
 * This applies to football and non-each-way horse racing bets.
 */
function calculateStandard({ opportunity, stake, commission }: Omit<CalculateProps, 'isEachWay'>): CalculatedStandardOpportunity {
  const { backOdds, layOdds } = opportunity;
  const commissionRate = commission / 100;

  const layStake = (backOdds * stake) / (layOdds - commissionRate);
  const liability = layStake * (layOdds - 1);
  const profit = stake * (backOdds - 1) - liability;
  const qualifyingLoss = layStake * (1 - commissionRate) - stake;

  return {
    calculationType: 'Standard',
    opportunity,
    backStake: stake,
    layStake,
    liability,
    profit,
    qualifyingLoss,
  };
}


// --- Formatting Utilities (Preserved) ---

export function formatCurrency(amount: number, showSign = false): string {
  const options = {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  const formatter = new Intl.NumberFormat('en-GB', options);
  const formattedAmount = formatter.format(Math.abs(amount));

  if (showSign) {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${formattedAmount}`;
  }
  
  return amount < 0 ? `-${formattedAmount}` : formattedAmount;
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateG-string('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function getTimeUntilKickoff(kickoff: Date): string {
  const now = new Date();
  const diff = kickoff.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  }
  return `${Math.floor(hours / 24)}d`;
}
