
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import {
  Wallet,
  Percent,
  Droplets,
  TrendingDown,
  Shield,
  Moon,
  Clock,
  ExternalLink,
  Heart,
  LogOut,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useHarmMinimisation } from '@/contexts/HarmMinimisationContext';

// Reusable component for a setting row with an input
function SettingRow({ icon, label, description, value, onChangeText, suffix }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholderTextColor={Colors.textTertiary}
        />
        {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

// Reusable component for a setting row with a toggle switch
function ToggleRow({ icon, label, description, value, onValueChange }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.backgroundTertiary, true: Colors.accent }}
        thumbColor={Colors.text}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const {
    state,
    setLossLimit,
    setSelfExclusion,
    isSelfExcluded,
  } = useHarmMinimisation();

  const [dailyLossLimit, setDailyLossLimit] = useState(state.dailyLossLimit.toString());

  const handleSelfExclusion = (days, durationText) => {
    Alert.alert(
      `Confirm Self-Exclusion`,
      `Are you sure you want to exclude yourself for ${durationText}? You won't be able to use any betting functions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => setSelfExclusion(days), style: 'destructive' },
      ]
    );
  };

  const handleLossLimitChange = (text) => {
    setDailyLossLimit(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      setLossLimit(num);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Betting Defaults and Feed Filters can remain as they are, managed by AppContext or local state */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Limits</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Shield size={20} color={Colors.warning} />}
            label="Max daily loss limit"
            description="Stop betting when this is hit"
            value={dailyLossLimit}
            onChangeText={handleLossLimitChange}
            suffix="£"
          />
          {/* Other safety settings can be added here as needed */}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Take a Break from Betting</Text>
        <View style={[styles.card, { opacity: isSelfExcluded ? 0.6 : 1 }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <LogOut size={20} color={Colors.loss} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Self-Exclusion</Text>
              <Text style={styles.settingDescription}>
                {isSelfExcluded
                  ? 'Self-exclusion is currently active'
                  : 'Lock the app for a set period'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.buttonGrid}>
            <Pressable
              style={styles.gridButton}
              disabled={isSelfExcluded}
              onPress={() => handleSelfExclusion(1, '24 hours')}
            >
              <Text style={styles.gridButtonText}>24 hours</Text>
            </Pressable>
            <Pressable
              style={styles.gridButton}
              disabled={isSelfExcluded}
              onPress={() => handleSelfExclusion(2, '48 hours')}
            >
              <Text style={styles.gridButtonText}>48 hours</Text>
            </Pressable>
            <Pressable
              style={styles.gridButton}
              disabled={isSelfExcluded}
              onPress={() => handleSelfExclusion(7, '1 week')}
            >
              <Text style={styles.gridButtonText}>1 week</Text>
            </Pressable>
            <Pressable
              style={styles.gridButton}
              disabled={isSelfExcluded}
              onPress={() => handleSelfExclusion(30, '1 month')}
            >
              <Text style={styles.gridButtonText}>1 month</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <Pressable style={styles.linkRow} onPress={() => openLink('https://www.begambleaware.org/')}>
            <Heart size={20} color={Colors.profit} />
            <Text style={styles.linkLabel}>BeGambleAware</Text>
            <ExternalLink size={18} color={Colors.textTertiary} />
          </Pressable>
          {/* Other support links... */}
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          18+ only. This tool is for information. Please gamble responsibly.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    minWidth: 50,
    paddingVertical: 8,
  },
  inputSuffix: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginLeft: 62,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  disclaimer: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
    paddingLeft: 62, // Aligns with the setting content
  },
  gridButton: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 8,
    paddingVertical: 12,
    width: '48%', // Two buttons per row
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
