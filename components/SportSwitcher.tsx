
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { Sport } from '@/types';
import Colors from '@/constants/colors';

export default function SportSwitcher() {
  const { activeSport, setActiveSport } = useApp();

  const sports: Sport[] = ['Football', 'HorseRacing'];

  return (
    <View style={styles.container}>
      {sports.map((sport) => (
        <Pressable
          key={sport}
          style={[styles.button, activeSport === sport && styles.activeButton]}
          onPress={() => setActiveSport(sport)}
        >
          <Text style={[styles.buttonText, activeSport === sport && styles.activeButtonText]}>
            {sport === 'HorseRacing' ? 'Racing' : sport}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 10,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeButtonText: {
    color: Colors.background,
  },
});
