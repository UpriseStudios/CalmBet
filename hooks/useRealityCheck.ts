
import { useState, useEffect } from 'react';
import { useHarmMinimisation } from '../contexts/HarmMinimisationContext';

const REALITY_CHECK_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds

/**
 * A hook to manage the logic for displaying the reality check modal.
 * It automatically checks if the modal should be shown based on the time elapsed
 * since the last check, as stored in the HarmMinimisationContext.
 */
export const useRealityCheck = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const { state, resetRealityCheckTimer, isLoading } = useHarmMinimisation();
  const { lastRealityCheckTime, sessionStartTime, sessionActions } = state;

  useEffect(() => {
    if (isLoading) return; // Don't run the timer until storage is loaded

    // Set up an interval to check if the reality check is due
    const interval = setInterval(() => {
      if (lastRealityCheckTime && (Date.now() - lastRealityCheckTime > REALITY_CHECK_INTERVAL)) {
        setModalVisible(true);
      }
    }, 60 * 1000); // Check every minute

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [lastRealityCheckTime, isLoading]);

  // Function to handle the user continuing after the reality check
  const handleContinue = () => {
    setModalVisible(false);
    resetRealityCheckTimer(); // Reset the timer in the persistent context
  };

  // Calculate session duration
  const getSessionDuration = () => {
    if (!sessionStartTime) return '0 minutes';
    const durationMinutes = Math.floor((Date.now() - sessionStartTime) / (1000 * 60));
    return `${durationMinutes} minutes`;
  };

  return {
    isModalVisible,
    handleContinue,
    sessionDuration: getSessionDuration(),
    sessionActions,
  };
};
