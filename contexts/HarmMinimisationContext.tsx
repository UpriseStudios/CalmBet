import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useApp } from './AppContext';
import { isWithinQuietHours } from '@/utils/calculations';

export type NudgeType = 'session' | 'late_night' | 'stake_limit' | 'daily_limit';

export interface Nudge {
  type: NudgeType;
  title: string;
  message: string;
  primaryAction: string;
  secondaryAction?: string;
}

export const [HarmMinimisationProvider, useHarmMinimisation] = createContextHook(() => {
  const { settings, sessionStats } = useApp();
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());
  const [breakUntil, setBreakUntil] = useState<Date | null>(null);

  const isOnBreak = useMemo(() => {
    if (!breakUntil) return false;
    return new Date() < breakUntil;
  }, [breakUntil]);

  const isQuietHours = useMemo(() => {
    if (!settings.quietHoursEnabled) return false;
    return isWithinQuietHours(settings.quietHoursStart, settings.quietHoursEnd);
  }, [settings.quietHoursEnabled, settings.quietHoursStart, settings.quietHoursEnd]);

  const shouldShowSessionNudge = useMemo(() => {
    if (dismissedNudges.has('session')) return false;
    return sessionStats.currentSessionActions >= settings.sessionNudgeThreshold;
  }, [sessionStats.currentSessionActions, settings.sessionNudgeThreshold, dismissedNudges]);

  const shouldShowLateNightNudge = useMemo(() => {
    if (dismissedNudges.has('late_night')) return false;
    return isQuietHours;
  }, [isQuietHours, dismissedNudges]);

  const checkStakeLimit = useCallback((stake: number): boolean => {
    return stake <= settings.maxStakePerBet;
  }, [settings.maxStakePerBet]);

  const checkDailyLimit = useCallback((additionalStake: number): boolean => {
    return (sessionStats.todayStake + additionalStake) <= settings.maxDailyStake;
  }, [sessionStats.todayStake, settings.maxDailyStake]);

  const getCurrentNudge = useCallback((proposedStake?: number): Nudge | null => {
    if (isOnBreak) {
      const minutesLeft = breakUntil ? Math.ceil((breakUntil.getTime() - new Date().getTime()) / 60000) : 0;
      return {
        type: 'session',
        title: 'Taking a break',
        message: `${minutesLeft} minutes remaining. Taking breaks helps maintain focus.`,
        primaryAction: 'Continue break',
        secondaryAction: 'End break early',
      };
    }

    if (shouldShowLateNightNudge) {
      return {
        type: 'late_night',
        title: 'Late night session',
        message: 'Tiredness increases errors. Consider stopping for tonight.',
        primaryAction: 'Stop for tonight',
        secondaryAction: 'Continue anyway',
      };
    }

    if (shouldShowSessionNudge) {
      return {
        type: 'session',
        title: 'You\'re on a roll',
        message: `You've completed ${sessionStats.currentSessionActions} actions in a row. A short break reduces mistakes.`,
        primaryAction: 'Take 5 minutes',
        secondaryAction: 'Continue',
      };
    }

    if (proposedStake !== undefined) {
      if (!checkStakeLimit(proposedStake)) {
        return {
          type: 'stake_limit',
          title: 'Above usual stake',
          message: `This stake (£${proposedStake}) exceeds your limit of £${settings.maxStakePerBet}. Double-check this is intentional.`,
          primaryAction: 'Adjust stake',
          secondaryAction: 'Proceed anyway',
        };
      }

      if (!checkDailyLimit(proposedStake)) {
        return {
          type: 'daily_limit',
          title: 'Daily limit reached',
          message: `Adding this would put you at £${sessionStats.todayStake + proposedStake} for today, above your £${settings.maxDailyStake} limit.`,
          primaryAction: 'Stop for today',
          secondaryAction: 'Proceed anyway',
        };
      }
    }

    return null;
  }, [
    isOnBreak,
    breakUntil,
    shouldShowLateNightNudge,
    shouldShowSessionNudge,
    sessionStats.currentSessionActions,
    sessionStats.todayStake,
    checkStakeLimit,
    checkDailyLimit,
    settings.maxStakePerBet,
    settings.maxDailyStake,
  ]);

  const dismissNudge = useCallback((type: NudgeType) => {
    setDismissedNudges(prev => new Set(prev).add(type));
  }, []);

  const takeBreak = useCallback((minutes: number) => {
    const until = new Date(Date.now() + minutes * 60000);
    setBreakUntil(until);
  }, []);

  const endBreak = useCallback(() => {
    setBreakUntil(null);
    setDismissedNudges(prev => {
      const next = new Set(prev);
      next.delete('session');
      return next;
    });
  }, []);

  return {
    isOnBreak,
    isQuietHours,
    getCurrentNudge,
    dismissNudge,
    takeBreak,
    endBreak,
    checkStakeLimit,
    checkDailyLimit,
  };
});
