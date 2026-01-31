import { Opportunity, CalculatedOpportunity } from '@/types';

export function calculateOpportunity(
  opportunity: Opportunity,
  backStake: number,
  commission: number
): CalculatedOpportunity {
  const { backOdds, layOdds } = opportunity;
  const commissionDecimal = commission / 100;

  const layStake = (backOdds * backStake) / (layOdds - commissionDecimal);
  const liability = (layOdds - 1) * layStake;

  const profitIfWin = (backOdds * backStake - backStake) - liability;
  const profitIfLose = layStake * (1 - commissionDecimal) - backStake;

  const isArb = profitIfWin >= 0 && profitIfLose >= 0;
  const qualifyingLoss = Math.min(profitIfWin, profitIfLose);

  return {
    ...opportunity,
    backStake,
    layStake: Math.round(layStake * 100) / 100,
    liability: Math.round(liability * 100) / 100,
    profitIfWin: Math.round(profitIfWin * 100) / 100,
    profitIfLose: Math.round(profitIfLose * 100) / 100,
    isArb,
    qualifyingLoss: Math.round(qualifyingLoss * 100) / 100,
  };
}

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
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function getTimeUntilKickoff(kickoff: Date): string {
  const now = new Date();
  const diff = kickoff.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (minutes < 60) {
    return `${minutes}m`;
  } else if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  }
  return `${Math.floor(hours / 24)}d`;
}

export function isWithinQuietHours(start: string, end: string): boolean {
  const now = new Date();
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
