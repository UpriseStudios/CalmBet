import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { Bookmaker, BOOKMAKER_NAMES } from '@/types';

interface BookmakerLogoProps {
  bookmaker: Bookmaker | 'betfair';
  size?: 'small' | 'medium' | 'large';
}

const BOOKMAKER_COLORS: Record<Bookmaker | 'betfair', string> = {
  bet365: Colors.bet365,
  skybet: Colors.skybet,
  williamhill: Colors.williamhill,
  paddypower: Colors.paddypower,
  ladbrokes: Colors.ladbrokes,
  betfair: Colors.betfair,
};

const BOOKMAKER_LABELS: Record<Bookmaker | 'betfair', string> = {
  ...BOOKMAKER_NAMES,
  betfair: 'Betfair',
};

const SIZES = {
  small: { badge: 24, text: 10 },
  medium: { badge: 32, text: 12 },
  large: { badge: 48, text: 14 },
};

export default function BookmakerLogo({ bookmaker, size = 'medium' }: BookmakerLogoProps) {
  const color = BOOKMAKER_COLORS[bookmaker];
  const label = BOOKMAKER_LABELS[bookmaker];
  const sizeConfig = SIZES[size];

  return (
    <View style={styles.container}>
      <View style={[
        styles.badge,
        { 
          width: sizeConfig.badge, 
          height: sizeConfig.badge,
          backgroundColor: color + '20',
          borderColor: color + '40',
        }
      ]}>
        <Text style={[styles.initial, { color, fontSize: sizeConfig.text }]}>
          {label.charAt(0)}
        </Text>
      </View>
      <Text style={[styles.label, { fontSize: sizeConfig.text, color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    fontWeight: '700' as const,
  },
  label: {
    fontWeight: '600' as const,
  },
});
