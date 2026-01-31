
import React, { createContext, useContext, useEffect, ReactNode, useMemo, useState } from 'react';
import { useStorage } from '../hooks/useStorage';

// Define the intervention levels
export type InterventionLevel = 'none' | 'gentleNudge' | 'warning' | 'break';

// Define the nudge types
export type NudgeType = 'session' | 'late_night' | 'stake_limit' | 'daily_limit';

export interface Nudge {
  type: NudgeType;
  title: string;
  message: string;
  primaryAction: string;
  secondaryAction?: string;
}

// Define the structure of the harm minimisation state
interface HarmMinimisationState {
  sessionStartTime: number | null;
  dailyLossLimit: number;
  currentLosses: number;
  consecutiveLosses: number;
  interventionLevel: InterventionLevel;
  isBreakActive: boolean;
  breakEndTime: number | null;
  selfExclusionEndDate: number | null;
  lastRealityCheckTime: number | null;
}

// Define the default values for the state
const defaultState: HarmMinimisationState = {
  sessionStartTime: null,
  dailyLossLimit: 100, // Default to a £100 loss limit
  currentLosses: 0,
  consecutiveLosses: 0,
  interventionLevel: 'none',
  isBreakActive: false,
  breakEndTime: null,
  selfExclusionEndDate: null,
  lastRealityCheckTime: null,
};

// Define the context shape
interface HarmMinimisationContextType {
  state: HarmMinimisationState;
  isLoading: boolean;
  isLossLimitReached: boolean;
  isSelfExcluded: boolean;
  nudge: Nudge | null;
  startSession: () => void;
  recordWin: () => void;
  recordLoss: (amount: number) => void;
  setLossLimit: (limit: number) => void;
  setSelfExclusion: (days: number) => void;
  isQuietHours: () => boolean;
  resetRealityCheckTimer: () => void;
  timeToNextCheck: number;
  triggerNudge: (nudge: Nudge) => void;
  dismissNudge: () => void;
}

// Create the context
const HarmMinimisationContext = createContext<HarmMinimisationContextType | undefined>(undefined);

const REALITY_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const BREAK_DURATION = 15 * 60 * 1000; // 15 minutes

// Create the provider component
export const HarmMinimisationProvider = ({ children }: { children: ReactNode }) => {
  const { value: state, save, loading } = useStorage<HarmMinimisationState>('harmMinimisationState', defaultState);
  const [nudge, setNudge] = useState<Nudge | null>(null);

  const isQuietHours = () => {
    const hours = new Date().getHours();
    return hours >= 23 || hours < 7;
  };

  const startSession = () => {
    const now = Date.now();
    save({
      ...defaultState, // Reset to default state on new session
      sessionStartTime: now,
      lastRealityCheckTime: now,
    });
  };

  const recordWin = () => {
    save({ ...state, consecutiveLosses: 0, interventionLevel: 'none' });
  };

  const recordLoss = (amount: number) => {
    const newLosses = state.currentLosses + amount;
    const newConsecutiveLosses = state.consecutiveLosses + 1;
    let newInterventionLevel: InterventionLevel = state.interventionLevel;
    let isBreakActive = false;
    let breakEndTime = null;

    if (newConsecutiveLosses >= 7) {
      newInterventionLevel = 'break';
      isBreakActive = true;
      breakEndTime = Date.now() + BREAK_DURATION;
    } else if (newConsecutiveLosses >= 5) {
      newInterventionLevel = 'warning';
    } else if (newConsecutiveLosses >= 3) {
      newInterventionLevel = 'gentleNudge';
    }

    save({
      ...state,
      currentLosses: newLosses,
      consecutiveLosses: newConsecutiveLosses,
      interventionLevel: newInterventionLevel,
      isBreakActive,
      breakEndTime,
    });
  };

  const setLossLimit = (limit: number) => {
    save({ ...state, dailyLossLimit: limit });
  };

  const setSelfExclusion = (days: number) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    // Important: Once set, the self-exclusion end date should not be reducible.
    if (!state.selfExclusionEndDate || endDate.getTime() > state.selfExclusionEndDate) {
      save({ ...state, selfExclusionEndDate: endDate.getTime() });
    }
  };
  
  const resetRealityCheckTimer = () => {
    save({ ...state, lastRealityCheckTime: Date.now() });
  };

  const triggerNudge = (nudgeInfo: Nudge) => {
    setNudge(nudgeInfo);
  }

  const dismissNudge = () => {
    setNudge(null);
  }

  // Check for break expiry
  useEffect(() => {
    if (state.isBreakActive && state.breakEndTime && Date.now() > state.breakEndTime) {
      save({ ...state, isBreakActive: false, breakEndTime: null, consecutiveLosses: 0, interventionLevel: 'none' });
    }
  }, [state.isBreakActive, state.breakEndTime, save]);

  // Start session on load
  useEffect(() => {
    if (!loading && !state.sessionStartTime) {
      startSession();
    }
  }, [loading, state.sessionStartTime]);
  
  const isLossLimitReached = useMemo(() => state.currentLosses >= state.dailyLossLimit, [state.currentLosses, state.dailyLossLimit]);
  const isSelfExcluded = useMemo(() => state.selfExclusionEndDate && Date.now() < state.selfExclusionEndDate, [state.selfExclusionEndDate]);

  const timeToNextCheck = useMemo(() => {
    if (!state.lastRealityCheckTime) return REALITY_CHECK_INTERVAL;
    const nextCheckTime = state.lastRealityCheckTime + REALITY_CHECK_INTERVAL;
    return Math.max(0, nextCheckTime - Date.now());
  }, [state.lastRealityCheckTime]);


  const contextValue = {
    state,
    isLoading: loading,
    isLossLimitReached,
    isSelfExcluded,
    nudge,
    startSession,
    recordWin,
    recordLoss,
    setLossLimit,
    setSelfExclusion,
    isQuietHours,
    resetRealityCheckTimer,
    timeToNextCheck,
    triggerNudge,
    dismissNudge,
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
