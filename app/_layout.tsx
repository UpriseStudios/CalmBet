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

function App() {
  const { isRealityCheckVisible, realityCheckData, handleContinue, handleTakeBreak } = useRealityCheck();

  return (
    <>
      <StatusBar style="light" />
      <RootLayoutNav />
      <RealityCheckModal 
        visible={isRealityCheckVisible}
        data={realityCheckData}
        onContinue={handleContinue}
        onTakeBreak={handleTakeBreak}
      />
    </>
  )
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <HarmMinimisationProvider>
            <App />
          </HarmMinimisationProvider>
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
