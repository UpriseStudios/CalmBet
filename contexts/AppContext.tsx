import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { 
  UserSettings, 
  SessionStats, 
  CompletedOpportunity, 
  DEFAULT_SETTINGS,
  CalculatedOpportunity 
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
        setSettingsState(JSON.parse(storedSettings));
      }
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        setHistory(parsed.map((h: CompletedOpportunity) => ({
          ...h,
          kickoff: new Date(h.kickoff),
          completedAt: new Date(h.completedAt),
        })));
      }
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        const today = new Date().toDateString();
        const sessionDate = parsed.lastActionTime ? new Date(parsed.lastActionTime).toDateString() : null;
        
        if (sessionDate === today) {
          setSessionStats({
            ...parsed,
            sessionStartTime: parsed.sessionStartTime ? new Date(parsed.sessionStartTime) : null,
            lastActionTime: parsed.lastActionTime ? new Date(parsed.lastActionTime) : null,
          });
        }
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

    const newStats: SessionStats = {
      actionsToday: sessionStats.actionsToday + 1,
      todayStake: sessionStats.todayStake + opportunity.backStake,
      currentSessionActions: sessionStats.currentSessionActions + 1,
      sessionStartTime: sessionStats.sessionStartTime || new Date(),
      lastActionTime: new Date(),
    };
    setSessionStats(newStats);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newStats));

    return newStats;
  }, [history, sessionStats]);

  const resetSession = useCallback(async () => {
    const newStats: SessionStats = {
      ...sessionStats,
      currentSessionActions: 0,
      sessionStartTime: null,
    };
    setSessionStats(newStats);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newStats));
  }, [sessionStats]);

  const todayHistory = useMemo(() => {
    const today = new Date().toDateString();
    return history.filter(h => new Date(h.completedAt).toDateString() === today);
  }, [history]);

  const todayNet = useMemo(() => {
    return todayHistory.reduce((sum, h) => sum + h.qualifyingLoss, 0);
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
  };
});
