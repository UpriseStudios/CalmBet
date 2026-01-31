import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  Linking
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
  Heart
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
}

function SettingRow({ icon, label, description, value, onChangeText, suffix }: SettingRowProps) {
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

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function ToggleRow({ icon, label, description, value, onValueChange }: ToggleRowProps) {
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
  const { settings, setSettings } = useApp();
  
  const [backStake, setBackStake] = useState(settings.defaultBackStake.toString());
  const [commission, setCommission] = useState(settings.commission.toString());
  const [minLiquidity, setMinLiquidity] = useState(settings.minLiquidity.toString());
  const [maxQualifyingLoss, setMaxQualifyingLoss] = useState(Math.abs(settings.maxQualifyingLoss).toString());
  const [maxStakePerBet, setMaxStakePerBet] = useState(settings.maxStakePerBet.toString());
  const [maxDailyStake, setMaxDailyStake] = useState(settings.maxDailyStake.toString());
  const [sessionThreshold, setSessionThreshold] = useState(settings.sessionNudgeThreshold.toString());

  const handleBackStakeChange = (text: string) => {
    setBackStake(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      setSettings({ defaultBackStake: num });
    }
  };

  const handleCommissionChange = (text: string) => {
    setCommission(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setSettings({ commission: num });
    }
  };

  const handleMinLiquidityChange = (text: string) => {
    setMinLiquidity(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num >= 0) {
      setSettings({ minLiquidity: num });
    }
  };

  const handleMaxQualifyingLossChange = (text: string) => {
    setMaxQualifyingLoss(text);
    const num = parseFloat(text);
    if (!isNaN(num)) {
      setSettings({ maxQualifyingLoss: -Math.abs(num) });
    }
  };

  const handleMaxStakePerBetChange = (text: string) => {
    setMaxStakePerBet(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      setSettings({ maxStakePerBet: num });
    }
  };

  const handleMaxDailyStakeChange = (text: string) => {
    setMaxDailyStake(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      setSettings({ maxDailyStake: num });
    }
  };

  const handleSessionThresholdChange = (text: string) => {
    setSessionThreshold(text);
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setSettings({ sessionNudgeThreshold: num });
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Betting Defaults</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Wallet size={20} color={Colors.accent} />}
            label="Default back stake"
            value={backStake}
            onChangeText={handleBackStakeChange}
            suffix="£"
          />
          <View style={styles.divider} />
          <SettingRow
            icon={<Percent size={20} color={Colors.accent} />}
            label="Exchange commission"
            value={commission}
            onChangeText={handleCommissionChange}
            suffix="%"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feed Filters</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Droplets size={20} color={Colors.betfair} />}
            label="Minimum liquidity"
            description="Hide opportunities below this"
            value={minLiquidity}
            onChangeText={handleMinLiquidityChange}
            suffix="£"
          />
          <View style={styles.divider} />
          <SettingRow
            icon={<TrendingDown size={20} color={Colors.loss} />}
            label="Max qualifying loss"
            description="Hide opportunities worse than"
            value={maxQualifyingLoss}
            onChangeText={handleMaxQualifyingLossChange}
            suffix="-£"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Limits</Text>
        <View style={styles.card}>
          <SettingRow
            icon={<Shield size={20} color={Colors.warning} />}
            label="Max stake per bet"
            description="Warn when exceeding"
            value={maxStakePerBet}
            onChangeText={handleMaxStakePerBetChange}
            suffix="£"
          />
          <View style={styles.divider} />
          <SettingRow
            icon={<Shield size={20} color={Colors.warning} />}
            label="Max daily stake"
            description="Total stake limit per day"
            value={maxDailyStake}
            onChangeText={handleMaxDailyStakeChange}
            suffix="£"
          />
          <View style={styles.divider} />
          <SettingRow
            icon={<Clock size={20} color={Colors.accent} />}
            label="Session nudge after"
            description="Actions before break reminder"
            value={sessionThreshold}
            onChangeText={handleSessionThresholdChange}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={<Moon size={20} color={Colors.warning} />}
            label="Late night warnings"
            description="Remind to stop after 23:30"
            value={settings.quietHoursEnabled}
            onValueChange={(value) => setSettings({ quietHoursEnabled: value })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <Pressable 
            style={styles.linkRow}
            onPress={() => openLink('https://www.begambleaware.org/')}
          >
            <View style={styles.settingIcon}>
              <Heart size={20} color={Colors.profit} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>BeGambleAware</Text>
              <Text style={styles.settingDescription}>Free support and advice</Text>
            </View>
            <ExternalLink size={18} color={Colors.textTertiary} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={styles.linkRow}
            onPress={() => openLink('https://www.gamcare.org.uk/')}
          >
            <View style={styles.settingIcon}>
              <Heart size={20} color={Colors.profit} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>GamCare</Text>
              <Text style={styles.settingDescription}>Free support for gambling problems</Text>
            </View>
            <ExternalLink size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          18+ only. This is an information and calculation tool. No guaranteed profit. 
          Gambling can be addictive. Please gamble responsibly.
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
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
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
    fontWeight: '600' as const,
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
});
