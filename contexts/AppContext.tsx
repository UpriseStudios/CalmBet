
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import {
  UserSettings,
  SessionStats,
  CompletedOpportunity,
  DEFAULT_SETTINGS,
  CalculatedOpportunity,
  Sport,
} from '@/types';
import { mockCompletedOpportunities } from '@/mocks/opportunities';

const SETTINGS_KEY = 'calmbet_settings';
const HISTORY_KEY = 'calmbet_history';
const SESSION_KEY = 'calmbet_session';

export const [AppProvider, useApp] = createContextHook(() => {
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<CompletedOpportunity[]>(mockCompletedOpportunities);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    actionsToday: 3,
    todayStake: 30,
    currentSessionActions: 0,
    sessionStartTime: null,
    lastActionTime: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeSport, setActiveSportState] = useState<Sport>(settings.sportPreference);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedSettings, storedHistory, storedSession] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
        AsyncStorage.getItem(SESSION_KEY),
      ]);

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettingsState(parsed);
        setActiveSportState(parsed.sportPreference || DEFAULT_SETTINGS.sportPreference);
      }
      if (storedHistory) {
        // ... (history loading remains the same)
      }
      if (storedSession) {
        // ... (session loading remains the same)
      }
    } catch (error) {
      console.log('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }, [settings]);

  const setActiveSport = useCallback((sport: Sport) => {
    setActiveSportState(sport);
    setSettings({ ...settings, sportPreference: sport });
  }, [settings, setSettings]);

  const completeOpportunity = useCallback(async (
    opportunity: CalculatedOpportunity,
    status: 'done' | 'odds_changed' | 'not_available'
  ) => {
    const completed: CompletedOpportunity = {
      ...opportunity,
      completedAt: new Date(),
      status,
    };
    const newHistory = [completed, ...history];
    setHistory(newHistory);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

    const stake = opportunity.calculationType === 'Standard' ? opportunity.backStake : opportunity.totalStake;

    const newStats: SessionStats = {
      actionsToday: sessionStats.actionsToday + 1,
      todayStake: sessionStats.todayStake + stake,
      currentSessionActions: sessionStats.currentSessionActions + 1,
      sessionStartTime: sessionStats.sessionStartTime || new Date(),
      lastActionTime: new Date(),
    };
    setSessionStats(newStats);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newStats));

    return newStats;
  }, [history, sessionStats]);

  const resetSession = useCallback(async () => {
    // ... (reset session remains the same)
  }, [sessionStats]);

  const todayHistory = useMemo(() => {
    const today = new Date().toDateString();
    return history.filter(h => new Date(h.completedAt).toDateString() === today);
  }, [history]);

  const todayNet = useMemo(() => {
    return todayHistory.reduce((sum, h) => {
      if (h.calculationType === 'Standard') {
        return sum + h.qualifyingLoss;
      }
      // For EachWay bets, 'profitIfLose' is the closest equivalent to a qualifying loss.
      // This assumes the bet was completed before the event and the worst-case scenario is used.
      return sum + (h as any).profitIfLose;
    }, 0);
  }, [todayHistory]);

  return {
    settings,
    setSettings,
    history,
    todayHistory,
    todayNet,
    sessionStats,
    completeOpportunity,
    resetSession,
    isLoading,
    activeSport,
    setActiveSport,
  };
});
