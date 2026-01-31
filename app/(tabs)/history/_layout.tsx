import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'History',
          headerLargeTitle: true,
          headerLargeTitleStyle: { color: Colors.text },
        }} 
      />
    </Stack>
  );
}
