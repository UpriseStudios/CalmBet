import { useState, useCallback, useMemo, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './AppContext';
import { isWithinQuietHours } from '@/utils/calculations';
import { NudgeType, SelfExclusionSettings } from '@/types';

const DISMISSED_NUDGES_KEY = 'calmbet_dismissed_nudges';
const SELF_EXCLUSION_KEY = 'calmbet_self_exclusion';

export interface Nudge {
  type: NudgeType;
  title: string;
  message: string;
  primaryAction: string;
  secondaryAction?: string;
}

export const [HarmMinimisationProvider, useHarmMinimisation] = createContextHook(() => {
  const { settings, sessionStats } = useApp();
  const [dismissedNudges, setDismissedNudges] = useState<Set<NudgeType>>(new Set());
  const [breakUntil, setBreakUntil] = useState<Date | null>(null);
  const [selfExclusion, setSelfExclusion] = useState<SelfExclusionSettings>({ isActive: false, exclusionUntil: null });

  useEffect(() => {
    loadDismissedNudges();
    loadSelfExclusion();
  }, []);

  const loadDismissedNudges = async () => {
    try {
      const storedNudges = await AsyncStorage.getItem(DISMISSED_NUDGES_KEY);
      if (storedNudges) {
        setDismissedNudges(new Set(JSON.parse(storedNudges)));
      }
    } catch (error) {
      console.log('Error loading dismissed nudges:', error);
    }
  };

  const loadSelfExclusion = async () => {
    try {
      const storedExclusion = await AsyncStorage.getItem(SELF_EXCLUSION_KEY);
      if (storedExclusion) {
        const parsed = JSON.parse(storedExclusion) as SelfExclusionSettings;
        if (parsed.isActive && parsed.exclusionUntil && new Date() < new Date(parsed.exclusionUntil)) {
          setSelfExclusion(parsed);
        } else {
          // If exclusion period has passed, reset it.
          await endSelfExclusion();
        }
      }
    } catch (error) {
      console.log('Error loading self-exclusion state:', error);
    }
  }

  const isOnBreak = useMemo(() => {
    if (!breakUntil) return false;
    return new Date() < breakUntil;
  }, [breakUntil]);

  const isSelfExcluded = useMemo(() => {
    if (!selfExclusion.isActive || !selfExclusion.exclusionUntil) return false;
    return new Date() < new Date(selfExclusion.exclusionUntil);
  }, [selfExclusion]);

  const isQuietHours = useMemo(() => {
    if (!settings.quietHoursEnabled) return false;
    return isWithinQuietHours(settings.quietHoursStart, settings.quietHoursEnd);
  }, [settings.quietHoursEnabled, settings.quietHoursStart, settings.quietHoursEnd]);

  const shouldShowSessionNudge = useMemo(() => {
    if (dismissedNudges.has(NudgeType.Session)) return false;
    return sessionStats.currentSessionActions >= settings.sessionNudgeThreshold;
  }, [sessionStats.currentSessionActions, settings.sessionNudgeThreshold, dismissedNudges]);

  const shouldShowLateNightNudge = useMemo(() => {
    if (dismissedNudges.has(NudgeType.LateNight)) return false;
    return isQuietHours;
  }, [isQuietHours, dismissedNudges]);

  const checkStakeLimit = useCallback((stake: number): boolean => {
    return stake <= settings.maxStakePerBet;
  }, [settings.maxStakePerBet]);

  const checkDailyLimit = useCallback((additionalStake: number): boolean => {
    return (sessionStats.todayStake + additionalStake) <= settings.maxDailyStake;
  }, [sessionStats.todayStake, settings.maxDailyStake]);

  const getCurrentNudge = useCallback((proposedStake?: number): Nudge | null => {
    if (isSelfExcluded && selfExclusion.exclusionUntil) {
      const exclusionDate = new Date(selfExclusion.exclusionUntil);
      return {
        type: NudgeType.SelfExclusion,
        title: 'Self-Exclusion Active',
        message: `Your self-exclusion period is active until ${exclusionDate.toLocaleDateString()} at ${exclusionDate.toLocaleTimeString()}. Betting features are disabled.`,
        primaryAction: 'View Support Resources',
      };
    }

    if (isOnBreak) {
      const minutesLeft = breakUntil ? Math.ceil((breakUntil.getTime() - new Date().getTime()) / 60000) : 0;
      return {
        type: NudgeType.Session,
        title: 'Taking a break',
        message: `${minutesLeft} minutes remaining. Taking breaks helps maintain focus.`,
        primaryAction: 'Continue break',
        secondaryAction: 'End break early',
      };
    }

    if (shouldShowLateNightNudge) {
      return {
        type: NudgeType.LateNight,
        title: 'Late night session',
        message: 'Tiredness increases errors. Consider stopping for tonight.',
        primaryAction: 'Stop for tonight',
        secondaryAction: 'Continue anyway',
      };
    }

    if (shouldShowSessionNudge) {
      return {
        type: NudgeType.Session,
        title: 'You\'re on a roll',
        message: `You\'ve completed ${sessionStats.currentSessionActions} actions in a row. A short break reduces mistakes.`,
        primaryAction: 'Take 5 minutes',
        secondaryAction: 'Continue',
      };
    }

    if (proposedStake !== undefined) {
      if (!checkStakeLimit(proposedStake)) {
        return {
          type: NudgeType.StakeLimit,
          title: 'Above usual stake',
          message: `This stake (£${proposedStake}) exceeds your limit of £${settings.maxStakePerBet}. Double-check this is intentional.`,
          primaryAction: 'Adjust stake',
          secondaryAction: 'Proceed anyway',
        };
      }

      if (!checkDailyLimit(proposedStake)) {
        return {
          type: NudgeType.DailyLimit,
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
    isSelfExcluded,
    selfExclusion,
    shouldShowLateNightNudge,
    shouldShowSessionNudge,
    sessionStats.currentSessionActions,
    sessionStats.todayStake,
    checkStakeLimit,
    checkDailyLimit,
    settings.maxStakePerBet,
    settings.maxDailyStake,
  ]);

  const dismissNudge = useCallback(async (type: NudgeType) => {
    const newDismissed = new Set(dismissedNudges).add(type);
    setDismissedNudges(newDismissed);
    await AsyncStorage.setItem(DISMISSED_NUDGES_KEY, JSON.stringify(Array.from(newDismissed)));
  }, [dismissedNudges]);

  const takeBreak = useCallback((minutes: number) => {
    const until = new Date(Date.now() + minutes * 60000);
    setBreakUntil(until);
  }, []);

  const endBreak = useCallback(async () => {
    setBreakUntil(null);
    const newDismissed = new Set(dismissedNudges);
    newDismissed.delete(NudgeType.Session);
    setDismissedNudges(newDismissed);
    await AsyncStorage.setItem(DISMISSED_NUDGES_KEY, JSON.stringify(Array.from(newDismissed)));
  }, [dismissedNudges]);

  const startSelfExclusion = useCallback(async (durationHours: number) => {
    const exclusionUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    const newExclusion: SelfExclusionSettings = {
      isActive: true,
      exclusionUntil: exclusionUntil.toISOString(),
    };
    setSelfExclusion(newExclusion);
    await AsyncStorage.setItem(SELF_EXCLUSION_KEY, JSON.stringify(newExclusion));
  }, []);

  const endSelfExclusion = useCallback(async () => {
    const newExclusion: SelfExclusionSettings = { isActive: false, exclusionUntil: null };
    setSelfExclusion(newExclusion);
    await AsyncStorage.setItem(SELF_EXCLUSION_KEY, JSON.stringify(newExclusion));
  }, []);

  return {
    isOnBreak,
    isQuietHours,
    isSelfExcluded,
    getCurrentNudge,
    dismissNudge,
    takeBreak,
    endBreak,
    startSelfExclusion,
    checkStakeLimit,
    checkDailyLimit,
  };
});
