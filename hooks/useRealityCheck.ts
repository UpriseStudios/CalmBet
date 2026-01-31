import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useHarmMinimisation } from '@/contexts/HarmMinimisationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_REALITY_CHECK_KEY = 'calmbet_last_reality_check';
const REALITY_CHECK_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds

export function useRealityCheck() {
  const { sessionStats, settings } = useApp();
  const { takeBreak, isSelfExcluded } = useHarmMinimisation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  useEffect(() => {
    loadLastCheckTime();
  }, []);

  useEffect(() => {
    const checkTriggers = () => {
      if (isModalVisible || isSelfExcluded) return;

      const now = new Date();
      if (lastCheckTime && (now.getTime() - lastCheckTime.getTime() > REALITY_CHECK_INTERVAL)) {
        triggerModal();
        return;
      }
      
      if (sessionStats.currentSessionActions >= 10) {
        triggerModal();
        return;
      }

      if (sessionStats.todayStake > settings.maxDailyStake * 0.5) {
        triggerModal();
        return;
      }
    };

    const interval = setInterval(checkTriggers, 10000); // Check every 10 seconds

    return () => clearInterval(interval);

  }, [sessionStats, settings, lastCheckTime, isModalVisible, isSelfExcluded]);

  const loadLastCheckTime = async () => {
    const storedTime = await AsyncStorage.getItem(LAST_REALITY_CHECK_KEY);
    if (storedTime) {
      setLastCheckTime(new Date(storedTime));
    }
  };

  const triggerModal = useCallback(() => {
    setModalVisible(true);
    const now = new Date();
    setLastCheckTime(now);
    AsyncStorage.setItem(LAST_REALITY_CHECK_KEY, now.toISOString());
  }, []);

  const handleContinue = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleTakeBreak = useCallback(() => {
    setModalVisible(false);
    takeBreak(15); // Take a 15-minute break
  }, [takeBreak]);

  const realityCheckData = {
    sessionDuration: sessionStats.sessionStartTime ? (new Date().getTime() - sessionStats.sessionStartTime.getTime()) / 60000 : 0,
    totalStaked: sessionStats.todayStake,
    netProfit: 0, // Placeholder - needs profit/loss tracking
    actionsCompleted: sessionStats.currentSessionActions,
  };

  return {
    isRealityCheckVisible: isModalVisible,
    realityCheckData,
    handleContinue,
    handleTakeBreak,
  };
}
