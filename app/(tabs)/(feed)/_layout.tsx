import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function FeedLayout() {
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
          title: 'Opportunities',
          headerLargeTitle: true,
          headerLargeTitleStyle: { color: Colors.text },
        }} 
      />
    </Stack>
  );
}
