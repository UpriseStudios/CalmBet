
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Colors from '@/constants/colors';
import { AppProvider } from '@/contexts/AppContext';
import { HarmMinimisationProvider } from '@/contexts/HarmMinimisationContext';
import { useRealityCheck } from '@/hooks/useRealityCheck';
import RealityCheckModal from '@/components/RealityCheckModal';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Main navigation stack
function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="opportunity/[id]" 
        options={{ 
          presentation: 'card',
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}

// A new component that includes the reality check logic
function AppWithHarmMinimisation() {
  const { isModalVisible, handleContinue, sessionDuration, sessionActions } = useRealityCheck();

  // A placeholder function for taking a break
  const handleTakeBreak = () => {
    console.log("User initiated a break. This will be implemented fully later.");
    handleContinue(); // For now, just close the modal
  };

  return (
    <>
      <StatusBar style="light" />
      <RootLayoutNav />
      <RealityCheckModal 
        visible={isModalVisible}
        sessionDuration={sessionDuration}
        sessionActions={sessionActions}
        onContinue={handleContinue}
        onTakeBreak={handleTakeBreak}
      />
    </>
  )
}

// The root layout that wraps the entire app in providers
export default function RootLayout() {
  useEffect(() => {
    // Hide the splash screen once the app is ready
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <HarmMinimisationProvider>
            <AppWithHarmMinimisation />
          </HarmMinimisationProvider>
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
