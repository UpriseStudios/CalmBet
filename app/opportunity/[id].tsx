
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  Copy, CheckCircle, AlertTriangle, XCircle, ArrowRight, Clock, Droplets, AlertCircle 
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useHarmMinimisation } from '@/contexts/HarmMinimisationContext';
import {
  CalculatedOpportunity,
  CalculatedStandardOpportunity,
  CalculatedEachWayOpportunity,
  Bookmaker,
  BOOKMAKER_NAMES
} from '@/types';
import { formatCurrency, formatTime, getTimeUntilKickoff } from '@/utils/calculations';
import NudgeModal from '@/components/NudgeModal';

const BOOKMAKER_COLORS: Record<Bookmaker, string> = {
  bet365: Colors.bet365,
  skybet: Colors.skybet,
  williamhill: Colors.williamhill,
  paddypower: Colors.paddypower,
  ladbrokes: Colors.ladbrokes,
};

// --- Sub-components for clean rendering ---

const DetailHeader = ({ opportunity }: { opportunity: CalculatedOpportunity['opportunity'] }) => (
  <View style={styles.matchHeader}>
    <Text style={styles.teams}>
      {opportunity.sport === 'Football' 
        ? `${opportunity.homeTeam} vs ${opportunity.awayTeam}` 
        : opportunity.eventName}
    </Text>
    <Text style={styles.competition}>
      {opportunity.sport === 'Football' ? opportunity.competition : opportunity.horseName}
    </Text>
    <View style={styles.timeRow}>
      <Clock size={14} color={Colors.textSecondary} />
      <Text style={styles.timeText}>
        {formatTime(opportunity.kickoff)} • {getTimeUntilKickoff(opportunity.kickoff)} until kickoff
      </Text>
    </View>
  </View>
);

const BetStep = ({ 
  step, 
  title, 
  bookmaker, 
  selection, 
  odds, 
  stake, 
  onCopy, 
  copied, 
  liability, 
  liquidity, 
  liquidityRatio,
}: any) => {
  const bookmakerName = bookmaker === 'betfair' ? 'Betfair' : BOOKMAKER_NAMES[bookmaker as Bookmaker];
  const bookmakerColor = bookmaker === 'betfair' ? Colors.betfair : BOOKMAKER_COLORS[bookmaker as Bookmaker];
  const isLowLiquidity = liquidityRatio && liquidityRatio < 3;

  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepBadge, { backgroundColor: bookmakerColor + '20' }]}>
          <Text style={[styles.stepNumber, { color: bookmakerColor }]}>{step}</Text>
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
        <View style={[styles.bookmakerTag, { backgroundColor: bookmakerColor + '15' }]}>
          <Text style={[styles.bookmakerTagText, { color: bookmakerColor }]}>{bookmakerName}</Text>
        </View>
      </View>

      <View style={styles.stepContent}>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Selection</Text>
          <Text style={styles.valueText}>{selection}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Odds</Text>
          <Text style={styles.valueHighlight}>{odds.toFixed(2)}</Text>
        </View>
        <Pressable style={styles.copyRow} onPress={onCopy}>
          <View>
            <Text style={styles.valueLabel}>Stake</Text>
            <Text style={styles.stakeValue}>{formatCurrency(stake)}</Text>
          </View>
          <View style={[styles.copyButton, copied && styles.copiedButton]}>
            {copied ? (
              <CheckCircle size={18} color={Colors.profit} />
            ) : (
              <Copy size={18} color={Colors.accent} />
            )}
            <Text style={[styles.copyText, copied && styles.copiedText]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </View>
        </Pressable>
        {liability !== undefined && (
          <View style={styles.liabilityRow}>
            <Text style={styles.liabilityLabel}>Liability</Text>
            <Text style={styles.liabilityValue}>{formatCurrency(liability)}</Text>
          </View>
        )}
        {liquidity !== undefined && (
           <View style={[styles.liquidityRow, isLowLiquidity && styles.liquidityWarningRow]}>
            {isLowLiquidity ? <AlertCircle size={14} color={Colors.warning} /> : <Droplets size={14} color={Colors.textTertiary} />}
            <Text style={[styles.liquidityText, isLowLiquidity && styles.liquidityWarningText]}>
              {formatCurrency(liquidity)} available
              {isLowLiquidity && ` (${liquidityRatio.toFixed(1)}x stake)`}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const StandardResultCard = ({ result }: { result: CalculatedStandardOpportunity }) => (
  <View style={styles.resultCard}>
    <Text style={styles.resultTitle}>Expected Result</Text>
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>If {result.opportunity.homeTeam} wins</Text>
      <Text style={[styles.resultValue, result.profitIfWin >= 0 ? styles.profitText : styles.lossText]}>
        {formatCurrency(result.profitIfWin, true)}
      </Text>
    </View>
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>If {result.opportunity.homeTeam} loses/draws</Text>
      <Text style={[styles.resultValue, result.profitIfLose >= 0 ? styles.profitText : styles.lossText]}>
        {formatCurrency(result.profitIfLose, true)}
      </Text>
    </View>
    <View style={styles.resultDivider} />
    <View style={[styles.netResultRow, result.qualifyingLoss >= 0 ? styles.profitBg : styles.lossBg]}>
       <Text style={styles.netResultLabel}>{result.qualifyingLoss >= 0 ? 'Arbitrage profit' : 'Qualifying loss'}</Text>
      <Text style={[styles.netResultValue, result.qualifyingLoss >= 0 ? styles.profitText : styles.lossText]}>
        {formatCurrency(result.qualifyingLoss, true)}
      </Text>
    </View>
  </View>
);

const EachWayResultCard = ({ result }: { result: CalculatedEachWayOpportunity }) => (
  <View style={styles.resultCard}>
    <Text style={styles.resultTitle}>Expected Result</Text>
    <View style={styles.eachWayResultContainer}>
      <View style={styles.eachWayResultRow}>
        <Text style={styles.eachWayResultLabel}>Horse Wins</Text>
        <Text style={[styles.eachWayResultValue, result.profitIfWin >= 0 ? styles.profitText : styles.lossText]}>
          {formatCurrency(result.profitIfWin, true)}
        </Text>
      </View>
      <View style={styles.eachWayResultRow}>
        <Text style={styles.eachWayResultLabel}>Horse Places</Text>
        <Text style={[styles.eachWayResultValue, result.profitIfPlace >= 0 ? styles.profitText : styles.lossText]}>
          {formatCurrency(result.profitIfPlace, true)}
        </Text>
      </View>
      <View style={styles.eachWayResultRow}>
        <Text style={styles.eachWayResultLabel}>Horse Loses</Text>
        <Text style={[styles.eachWayResultValue, result.profitIfLose >= 0 ? styles.profitText : styles.lossText]}>
          {formatCurrency(result.profitIfLose, true)}
        </Text>
      </View>
    </View>
  </View>
);


// --- Main Screen Component ---

export default function OpportunityDetailScreen() {
  const router = useRouter();
  const { calculated: calculatedStr } = useLocalSearchParams<{ calculated: string }>();
  const { completeOpportunity } = useApp();
  const { getCurrentNudge, dismissNudge, takeBreak } = useHarmMinimisation();
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);

  const calculated = useMemo(() => {
    if (!calculatedStr) return null;
    try {
      // The calculated object is passed as a string, so we need to parse it back
      return JSON.parse(calculatedStr) as CalculatedOpportunity;
    } catch (e) {
      console.error("Failed to parse calculated opportunity:", e);
      return null;
    }
  }, [calculatedStr]);

  const nudge = useMemo(() => {
    if (!calculated) return null;
    return getCurrentNudge(calculated.backStake);
  }, [calculated, getCurrentNudge]);
  
  const copyToClipboard = useCallback(async (value: string, field: string) => {
    await Clipboard.setStringAsync(value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleAction = useCallback(async (status: 'done' | 'odds_changed' | 'not_available') => {
    if (!calculated) return;

    if (status === 'done' && nudge) {
      setShowNudge(true);
      return;
    }

    const newStats = await completeOpportunity(calculated, status);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      status === 'done' ? 'Marked as Done' : status === 'odds_changed' ? 'Odds Changed' : 'Not Available',
      status === 'done' 
        ? `Great! ${newStats.currentSessionActions} actions this session.`
        : 'This opportunity has been logged.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [calculated, nudge, completeOpportunity, router]);
  
  const handleNudgePrimary = useCallback(() => {
    if (nudge?.type === 'session') {
      takeBreak(5); // Start a 5-minute break
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
    
    // Proceed with the action after dismissing the nudge
    if (calculated) {
      const newStats = await completeOpportunity(calculated, 'done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Marked as Done',
        `Great! ${newStats.currentSessionActions} actions this session.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [nudge, dismissNudge, calculated, completeOpportunity, router]);

  if (!calculated) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <Text style={styles.errorText}>Opportunity not found or data is invalid.</Text>
      </View>
    );
  }

  const { opportunity, calculationType } = calculated;

  const renderBettingSteps = () => {
    if (calculationType === 'Standard') {
      const standardCalc = calculated as CalculatedStandardOpportunity;
      return (
        <>
          <BetStep
            step="1"
            title="Back Bet"
            bookmaker={opportunity.bookmaker}
            selection={opportunity.homeTeam}
            odds={opportunity.backOdds}
            stake={standardCalc.backStake}
            onCopy={() => copyToClipboard(standardCalc.backStake.toFixed(2), 'backStake')}
            copied={copiedField === 'backStake'}
          />
          <View style={styles.arrowContainer}>
             <ArrowRight size={16} color={Colors.text} />
          </View>
          <BetStep
            step="2"
            title="Lay Bet"
            bookmaker="betfair"
            selection={opportunity.homeTeam}
            odds={opportunity.layOdds}
            stake={standardCalc.layStake}
            onCopy={() => copyToClipboard(standardCalc.layStake.toFixed(2), 'layStake')}
            copied={copiedField === 'layStake'}
            liability={standardCalc.liability}
            liquidity={opportunity.liquidity}
            liquidityRatio={opportunity.liquidity / standardCalc.layStake}
          />
        </>
      );
    }

    if (calculationType === 'EachWay') {
      const eachWayCalc = calculated as CalculatedEachWayOpportunity;
      const selection = opportunity.sport === 'HorseRacing' ? opportunity.horseName : 'Selection';
      return (
        <>
          <BetStep
            step="1"
            title="Back Bet (Each Way)"
            bookmaker={opportunity.bookmaker}
            selection={selection}
            odds={opportunity.backOdds}
            stake={eachWayCalc.backStake}
            onCopy={() => copyToClipboard(eachWayCalc.backStake.toFixed(2), 'backStake')}
            copied={copiedField === 'backStake'}
          />
           <View style={styles.arrowContainer}>
             <ArrowRight size={16} color={Colors.text} />
          </View>
          <BetStep
            step="2"
            title="Lay Bet (Win)"
            bookmaker="betfair"
            selection={selection}
            odds={opportunity.layOdds}
            stake={eachWayCalc.winLayStake}
            onCopy={() => copyToClipboard(eachWayCalc.winLayStake.toFixed(2), 'winLayStake')}
            copied={copiedField === 'winLayStake'}
            liability={eachWayCalc.winLiability}
          />
           <View style={styles.arrowContainer}>
             <ArrowRight size={16} color={Colors.text} />
          </View>
          <BetStep
            step="3"
            title="Lay Bet (Place)"
            bookmaker="betfair"
            selection={selection}
            odds={eachWayCalc.placeLayOdds}
            stake={eachWayCalc.placeLayStake}
            onCopy={() => copyToClipboard(eachWayCalc.placeLayStake.toFixed(2), 'placeLayStake')}
            copied={copiedField === 'placeLayStake'}
            liability={eachWayCalc.placeLiability}
            liquidity={opportunity.liquidity}
            liquidityRatio={opportunity.liquidity / (eachWayCalc.winLayStake + eachWayCalc.placeLayStake)}
          />
        </>
      );
    }

    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Instructions' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <DetailHeader opportunity={opportunity} />
        <View style={styles.stepsContainer}>
          {renderBettingSteps()}
        </View>

        {calculationType === 'Standard' && <StandardResultCard result={calculated as CalculatedStandardOpportunity} />}
        {calculationType === 'EachWay' && <EachWayResultCard result={calculated as CalculatedEachWayOpportunity} />}

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
        visible={showNudge} 
        nudge={nudge} 
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
    fontWeight: '700',
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
    gap: 16,
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
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
    textAlign: 'right',
  },
  valueHighlight: {
    fontSize: 18,
    fontWeight: '700',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '500',
    color: Colors.text,
  },
  netResultValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  eachWayResultContainer: {
    gap: 12,
  },
  eachWayResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  eachWayResultLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  eachWayResultValue: {
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

