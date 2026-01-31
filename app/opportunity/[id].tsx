import React, { useMemo, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Pressable,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ArrowRight,
  Clock,
  Droplets,
  AlertCircle
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useHarmMinimisation } from '@/contexts/HarmMinimisationContext';
import { mockOpportunities } from '@/mocks/opportunities';
import { calculateOpportunity, formatCurrency, formatTime, getTimeUntilKickoff } from '@/utils/calculations';
import { BOOKMAKER_NAMES, Bookmaker } from '@/types';
import NudgeModal from '@/components/NudgeModal';

const BOOKMAKER_COLORS: Record<Bookmaker, string> = {
  bet365: Colors.bet365,
  skybet: Colors.skybet,
  williamhill: Colors.williamhill,
  paddypower: Colors.paddypower,
  ladbrokes: Colors.ladbrokes,
};

export default function OpportunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { settings, completeOpportunity } = useApp();
  const { getCurrentNudge, dismissNudge, takeBreak } = useHarmMinimisation();
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);

  const opportunity = useMemo(() => {
    const base = mockOpportunities.find(o => o.id === id);
    if (!base) return null;
    return calculateOpportunity(base, settings.defaultBackStake, settings.commission);
  }, [id, settings]);

  const nudge = getCurrentNudge(opportunity?.backStake);

  const copyToClipboard = useCallback(async (value: string, field: string) => {
    await Clipboard.setStringAsync(value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleAction = useCallback(async (status: 'done' | 'odds_changed' | 'not_available') => {
    if (!opportunity) return;

    if (status === 'done' && nudge) {
      setShowNudge(true);
      return;
    }

    const newStats = await completeOpportunity(opportunity, status);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      status === 'done' ? 'Marked as Done' : status === 'odds_changed' ? 'Odds Changed' : 'Not Available',
      status === 'done' 
        ? `Great! ${newStats.currentSessionActions} actions this session.`
        : 'This opportunity has been logged.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [opportunity, nudge, completeOpportunity, router]);

  const handleNudgePrimary = useCallback(() => {
    if (nudge?.type === 'session') {
      takeBreak(5);
    } else if (nudge?.type === 'stake_limit' || nudge?.type === 'daily_limit') {
      router.push('/settings');
    }
    setShowNudge(false);
  }, [nudge, takeBreak, router]);

  const handleNudgeSecondary = useCallback(async () => {
    if (nudge) {
      dismissNudge(nudge.type);
    }
    setShowNudge(false);
    
    if (opportunity) {
      const newStats = await completeOpportunity(opportunity, 'done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Marked as Done',
        `Great! ${newStats.currentSessionActions} actions this session.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [nudge, dismissNudge, opportunity, completeOpportunity, router]);

  if (!opportunity) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.errorText}>Opportunity not found</Text>
      </View>
    );
  }

  const bookmakerColor = BOOKMAKER_COLORS[opportunity.bookmaker];
  const isProfit = opportunity.qualifyingLoss >= 0;
  const worstCase = Math.min(opportunity.profitIfWin, opportunity.profitIfLose);
  const liquidityRatio = opportunity.liquidity / opportunity.layStake;
  const isLowLiquidity = liquidityRatio < 3;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Instructions',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.teams}>
            {opportunity.homeTeam} vs {opportunity.awayTeam}
          </Text>
          <Text style={styles.competition}>{opportunity.competition}</Text>
          <View style={styles.timeRow}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.timeText}>
              {formatTime(opportunity.kickoff)} • {getTimeUntilKickoff(opportunity.kickoff)} until kickoff
            </Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, { backgroundColor: bookmakerColor + '20' }]}>
                <Text style={[styles.stepNumber, { color: bookmakerColor }]}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Back Bet</Text>
              <View style={[styles.bookmakerTag, { backgroundColor: bookmakerColor + '15' }]}>
                <Text style={[styles.bookmakerTagText, { color: bookmakerColor }]}>
                  {BOOKMAKER_NAMES[opportunity.bookmaker]}
                </Text>
              </View>
            </View>
            
            <View style={styles.stepContent}>
              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Selection</Text>
                <Text style={styles.valueText}>{opportunity.homeTeam} to win</Text>
              </View>
              
              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Odds</Text>
                <Text style={styles.valueHighlight}>{opportunity.backOdds.toFixed(2)}</Text>
              </View>

              <Pressable 
                style={styles.copyRow}
                onPress={() => copyToClipboard(opportunity.backStake.toFixed(2), 'backStake')}
              >
                <View>
                  <Text style={styles.valueLabel}>Stake</Text>
                  <Text style={styles.stakeValue}>£{opportunity.backStake.toFixed(2)}</Text>
                </View>
                <View style={[
                  styles.copyButton,
                  copiedField === 'backStake' && styles.copiedButton
                ]}>
                  {copiedField === 'backStake' ? (
                    <CheckCircle size={18} color={Colors.profit} />
                  ) : (
                    <Copy size={18} color={Colors.accent} />
                  )}
                  <Text style={[
                    styles.copyText,
                    copiedField === 'backStake' && styles.copiedText
                  ]}>
                    {copiedField === 'backStake' ? 'Copied!' : 'Copy'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <View style={styles.arrowLine} />
            <View style={styles.arrowCircle}>
              <ArrowRight size={16} color={Colors.text} />
            </View>
            <View style={styles.arrowLine} />
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, { backgroundColor: Colors.betfair + '20' }]}>
                <Text style={[styles.stepNumber, { color: Colors.betfair }]}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Lay Bet</Text>
              <View style={[styles.bookmakerTag, { backgroundColor: Colors.betfair + '15' }]}>
                <Text style={[styles.bookmakerTagText, { color: Colors.betfair }]}>
                  Betfair
                </Text>
              </View>
            </View>
            
            <View style={styles.stepContent}>
              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Selection</Text>
                <Text style={styles.valueText}>{opportunity.homeTeam} to win</Text>
              </View>
              
              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Lay Odds</Text>
                <Text style={styles.valueHighlight}>{opportunity.layOdds.toFixed(2)}</Text>
              </View>

              <Pressable 
                style={styles.copyRow}
                onPress={() => copyToClipboard(opportunity.layStake.toFixed(2), 'layStake')}
              >
                <View>
                  <Text style={styles.valueLabel}>Lay Stake</Text>
                  <Text style={styles.stakeValue}>£{opportunity.layStake.toFixed(2)}</Text>
                </View>
                <View style={[
                  styles.copyButton,
                  copiedField === 'layStake' && styles.copiedButton
                ]}>
                  {copiedField === 'layStake' ? (
                    <CheckCircle size={18} color={Colors.profit} />
                  ) : (
                    <Copy size={18} color={Colors.accent} />
                  )}
                  <Text style={[
                    styles.copyText,
                    copiedField === 'layStake' && styles.copiedText
                  ]}>
                    {copiedField === 'layStake' ? 'Copied!' : 'Copy'}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.liabilityRow}>
                <Text style={styles.liabilityLabel}>Liability required</Text>
                <Text style={styles.liabilityValue}>£{opportunity.liability.toFixed(2)}</Text>
              </View>

              <View style={[styles.liquidityRow, isLowLiquidity && styles.liquidityWarningRow]}>
                {isLowLiquidity ? (
                  <AlertCircle size={14} color={Colors.warning} />
                ) : (
                  <Droplets size={14} color={Colors.textTertiary} />
                )}
                <Text style={[styles.liquidityText, isLowLiquidity && styles.liquidityWarningText]}>
                  £{opportunity.liquidity.toLocaleString()} available
                  {isLowLiquidity && ` (${liquidityRatio.toFixed(1)}x stake)`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Expected Result</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>If {opportunity.homeTeam} wins</Text>
            <Text style={[
              styles.resultValue,
              opportunity.profitIfWin >= 0 ? styles.profitText : styles.lossText
            ]}>
              {formatCurrency(opportunity.profitIfWin, true)}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>If {opportunity.homeTeam} loses/draws</Text>
            <Text style={[
              styles.resultValue,
              opportunity.profitIfLose >= 0 ? styles.profitText : styles.lossText
            ]}>
              {formatCurrency(opportunity.profitIfLose, true)}
            </Text>
          </View>

          <View style={styles.resultDivider} />

          <View style={[
            styles.netResultRow,
            isProfit ? styles.profitBg : styles.lossBg
          ]}>
            <View>
              <Text style={styles.netResultLabel}>
                {isProfit ? 'Arbitrage profit' : 'Worst case (qualifying loss)'}
              </Text>
              <Text style={styles.netResultHint}>
                = min({formatCurrency(opportunity.profitIfWin, true)}, {formatCurrency(opportunity.profitIfLose, true)})
              </Text>
            </View>
            <Text style={[
              styles.netResultValue,
              isProfit ? styles.profitText : styles.lossText
            ]}>
              {formatCurrency(worstCase, true)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable 
            style={[styles.actionButton, styles.doneButton]}
            onPress={() => handleAction('done')}
          >
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.doneButtonText}>Mark as Done</Text>
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleAction('odds_changed')}
            >
              <AlertTriangle size={18} color={Colors.warning} />
              <Text style={styles.secondaryButtonText}>Odds Changed</Text>
            </Pressable>

            <Pressable 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleAction('not_available')}
            >
              <XCircle size={18} color={Colors.loss} />
              <Text style={styles.secondaryButtonText}>Not Available</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <NudgeModal
        nudge={nudge}
        visible={showNudge}
        onPrimaryAction={handleNudgePrimary}
        onSecondaryAction={handleNudgeSecondary}
        onDismiss={() => setShowNudge(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 48,
  },
  matchHeader: {
    marginBottom: 24,
  },
  teams: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  competition: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  bookmakerTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookmakerTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  stepContent: {
    gap: 12,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  valueText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  valueHighlight: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  stakeValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  copiedButton: {
    backgroundColor: Colors.profitBg,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  copiedText: {
    color: Colors.profit,
  },
  liabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  liabilityLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  liabilityValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  liquidityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liquidityText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  liquidityWarningRow: {
    backgroundColor: Colors.warningBg,
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  liquidityWarningText: {
    color: Colors.warning,
    fontWeight: '500' as const,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  arrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.cardBorder,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  profitText: {
    color: Colors.profit,
  },
  lossText: {
    color: Colors.loss,
  },
  resultDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 12,
  },
  netResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  profitBg: {
    backgroundColor: Colors.profitBg,
  },
  lossBg: {
    backgroundColor: Colors.lossBg,
  },
  netResultLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  netResultHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  netResultValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  doneButton: {
    backgroundColor: Colors.accent,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.backgroundTertiary,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
