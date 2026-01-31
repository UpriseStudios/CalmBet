
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useStorage } from '../hooks/useStorage';

// Define the structure of the harm minimisation state
interface HarmMinimisationState {
  sessionStartTime: number | null;
  sessionActions: number;
  dailyLossLimit: number;
  currentLosses: number;
  isBreakActive: boolean;
  breakEndTime: number | null;
  lastRealityCheckTime: number | null;
}

// Define the default values for the state
const defaultState: HarmMinimisationState = {
  sessionStartTime: null,
  sessionActions: 0,
  dailyLossLimit: 100, // Default to a £100 loss limit
  currentLosses: 0,
  isBreakActive: false,
  breakEndTime: null,
  lastRealityCheckTime: null,
};

// Define the context shape
interface HarmMinimisationContextType {
  state: HarmMinimisationState;
  startSession: () => void;
  incrementActions: () => void;
  addLoss: (amount: number) => void;
  setLossLimit: (limit: number) => void;
  isQuietHours: () => boolean;
  isLoading: boolean;
  resetRealityCheckTimer: () => void;
}

// Create the context
const HarmMinimisationContext = createContext<HarmMinimisationContextType | undefined>(undefined);

// Create the provider component
export const HarmMinimisationProvider = ({ children }: { children: ReactNode }) => {
  const { value: state, save, loading } = useStorage<HarmMinimisationState>('harmMinimisationState', defaultState);

  // Function to check if it's currently quiet hours (e.g., late at night)
  const isQuietHours = () => {
    const now = new Date();
    const hours = now.getHours();
    // Quiet hours are between 11:30 PM and 7:00 AM
    return hours >= 23 || hours < 7;
  };

  // Function to start a new session
  const startSession = () => {
    const now = Date.now();
    save({
      ...state,
      sessionStartTime: now,
      sessionActions: 0,
      lastRealityCheckTime: now, // Start the reality check timer at session start
    });
  };

  // Function to increment the action count for the current session
  const incrementActions = () => {
    save({ ...state, sessionActions: state.sessionActions + 1 });
  };

  // Function to add to the current losses
  const addLoss = (amount: number) => {
    save({ ...state, currentLosses: state.currentLosses + amount });
  };

  // Function to set a new daily loss limit
  const setLossLimit = (limit: number) => {
    save({ ...state, dailyLossLimit: limit });
  };

  // Function to reset the reality check timer
  const resetRealityCheckTimer = () => {
    save({ ...state, lastRealityCheckTime: Date.now() });
  };
  

  // Automatically start a session on app load if one isn't active
  useEffect(() => {
    if (!loading && !state.sessionStartTime) {
      startSession();
    }
  }, [loading, state.sessionStartTime]);

  const contextValue = {
    state,
    startSession,
    incrementActions,
    addLoss,
    setLossLimit,
    isQuietHours,
    isLoading: loading,
    resetRealityCheckTimer,
  };

  return (
    <HarmMinimisationContext.Provider value={contextValue}>
      {children}
    </HarmMinimisationContext.Provider>
  );
};

// Custom hook to use the context
export const useHarmMinimisation = () => {
  const context = useContext(HarmMinimisationContext);
  if (context === undefined) {
    throw new Error('useHarmMinimisation must be used within a HarmMinimisationProvider');
  }
  return context;
};
