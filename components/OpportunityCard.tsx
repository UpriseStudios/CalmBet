
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import {
  TrendingUp, TrendingDown, Clock, Droplets, AlertCircle 
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { 
  Opportunity, 
  CalculatedOpportunity,
  CalculatedStandardOpportunity,
  CalculatedEachWayOpportunity,
  BOOKMAKER_NAMES,
  Bookmaker 
} from '@/types';
import { useApp } from '@/contexts/AppContext';
import { calculate, formatCurrency, formatTime, getTimeUntilKickoff } from '@/utils/calculations';

// --- Component Props ---

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: (calculated: CalculatedOpportunity) => void;
}

// --- Sub-components for clean rendering ---

const CardHeader = ({ opportunity }: { opportunity: Opportunity }) => {
  const mainText = opportunity.sport === 'Football' 
    ? `${opportunity.homeTeam} vs ${opportunity.awayTeam}` 
    : opportunity.eventName;
  const subText = opportunity.sport === 'Football' 
    ? opportunity.competition 
    : opportunity.horseName;

  return (
    <View style={styles.matchInfo}>
      <Text style={styles.teams} numberOfLines={1}>{mainText}</Text>
      <Text style={styles.competition}>{subText}</Text>
    </View>
  );
};

const EachWayResultDisplay = ({ result }: { result: CalculatedEachWayOpportunity }) => (
  <View style={styles.eachWayContainer}>
    <View style={styles.eachWayRow}>
      <Text style={styles.eachWayLabel}>Win</Text>
      <Text style={[styles.eachWayValue, result.profitIfWin > 0 ? styles.profitText : styles.lossText]}>
        {formatCurrency(result.profitIfWin, true)}
      </Text>
    </View>
    <View style={styles.eachWayRow}>
      <Text style={styles.eachWayLabel}>Place</Text>
      <Text style={[styles.eachWayValue, result.profitIfPlace > 0 ? styles.profitText : styles.lossText]}>
        {formatCurrency(result.profitIfPlace, true)}
      </Text>
    </View>
    <View style={styles.eachWayRow}>
      <Text style={styles.eachWayLabel}>Lose</Text>
      <Text style={[styles.eachWayValue, result.profitIfLose > 0 ? styles.profitText : styles.lossText]}>
        {formatCurrency(result.profitIfLose, true)}
      </Text>
    </View>
  </View>
);

const StandardResultDisplay = ({ result }: { result: CalculatedStandardOpportunity }) => {
  const isProfit = result.qualifyingLoss >= 0;
  return (
    <View style={[
      styles.resultBadge,
      isProfit ? styles.profitBadge : styles.lossBadge
    ]}>
      {isProfit ? (
        <TrendingUp size={14} color={Colors.profit} />
      ) : (
        <TrendingDown size={14} color={Colors.loss} />
      )}
      <Text style={[
        styles.resultValue,
        isProfit ? styles.profitText : styles.lossText
      ]}>
        {formatCurrency(result.qualifyingLoss, true)}
      </Text>
    </View>
  );
};

// --- Main Card Component ---

export default function OpportunityCard({ opportunity, onPress }: OpportunityCardProps) {
  const { settings } = useApp();
  const [isEachWay, setIsEachWay] = useState(opportunity.sport === 'HorseRacing');

  // Recalculate whenever the opportunity or toggle changes
  const calculated = useMemo(() => {
    return calculate({
      opportunity,
      stake: settings.defaultBackStake,
      commission: settings.commission,
      isEachWay: opportunity.sport === 'HorseRacing' && isEachWay,
    });
  }, [opportunity, isEachWay, settings]);

  const timeUntil = getTimeUntilKickoff(opportunity.kickoff);
  const bookmakerColor = BOOKMAKER_COLORS[opportunity.bookmaker];

  return (
    <Pressable 
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(calculated)}
    >
      {/* --- Header --- */}
      <View style={styles.header}>
        <CardHeader opportunity={opportunity} />
        <View style={styles.timeContainer}>
          <Clock size={12} color={Colors.textSecondary} />
          <Text style={styles.time}>{timeUntil}</Text>
        </View>
      </View>

      {/* --- Odds and Anomaly --- */}
      <View style={styles.oddsRow}>
        {/* Back Bet */}
        <View style={styles.oddsBlock}>
          <View style={[styles.bookmakerBadge, { backgroundColor: bookmakerColor + '20' }]}>
            <View style={[styles.bookmakerDot, { backgroundColor: bookmakerColor }]} />
            <Text style={[styles.bookmakerName, { color: bookmakerColor }]}>
              {BOOKMAKER_NAMES[opportunity.bookmaker]}
            </Text>
          </View>
          <Text style={styles.oddsLabel}>Back</Text>
          <Text style={styles.oddsValue}>{opportunity.backOdds.toFixed(2)}</Text>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <View style={styles.arrowLine} />
          <View style={styles.arrowHead} />
        </View>

        {/* Lay Bet */}
        <View style={styles.oddsBlock}>
           {/* ... (Betfair badge) ... */}
          <Text style={styles.oddsLabel}>Lay</Text>
          <Text style={styles.oddsValue}>{opportunity.layOdds.toFixed(2)}</Text>
        </View>

        {/* Anomaly Badge */}
        {opportunity.anomaly && (
          <View style={styles.anomalyBadge}>
            <AlertCircle size={14} color={Colors.warning} />
            <Text style={styles.anomalyText}>{opportunity.anomaly.type}</Text>
          </View>
        )}
      </View>

      {/* --- Each Way Toggle --- */}
      {opportunity.sport === 'HorseRacing' && (
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Each Way Bet</Text>
          <Switch
            value={isEachWay}
            onValueChange={setIsEachWay}
            trackColor={{ false: Colors.background, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        </View>
      )}

      {/* --- Results Display --- */}
      <View style={styles.resultsContainer}>
        {calculated.calculationType === 'Standard' ? (
          <StandardResultDisplay result={calculated as CalculatedStandardOpportunity} />
        ) : (
          <EachWayResultDisplay result={calculated as CalculatedEachWayOpportunity} />
        )}
      </View>

      {/* --- Footer --- */}
      <View style={styles.footer}>
        <View style={styles.liquidityContainer}>
          <Droplets size={12} color={Colors.textTertiary} />
          <Text style={styles.liquidityText}>£{opportunity.liquidity.toLocaleString()} available</Text>
        </View>
        <Text style={styles.kickoffTime}>{formatTime(opportunity.kickoff)}</Text>
      </View>
    </Pressable>
  );
}

// --- Styles (condensed for brevity) ---
// ... (Most styles are similar to before, with additions for new elements)
const BOOKMAKER_COLORS: Record<Bookmaker, string> = {
  bet365: Colors.bet365,
  skybet: Colors.skybet,
  williamhill: Colors.williamhill,
  paddypower: Colors.paddypower,
  ladbrokes: Colors.ladbrokes,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  matchInfo: { flex: 1, marginRight: 12 },
  teams: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  competition: { fontSize: 13, color: Colors.textSecondary },
  timeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundTertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  time: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  oddsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  oddsBlock: { flex: 1 },
  bookmakerBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6, gap: 4 },
  bookmakerDot: { width: 6, height: 6, borderRadius: 3 },
  bookmakerName: { fontSize: 11, fontWeight: '600' },
  oddsLabel: { fontSize: 11, color: Colors.textTertiary, marginBottom: 2 },
  oddsValue: { fontSize: 20, fontWeight: '700', color: Colors.text },
  arrowContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginTop: 20 },
  arrowLine: { width: 16, height: 2, backgroundColor: Colors.cardBorder },
  arrowHead: { width: 0, height: 0, borderLeftWidth: 6, borderTopWidth: 4, borderBottomWidth: 4, borderLeftColor: Colors.cardBorder, borderTopColor: 'transparent', borderBottomColor: 'transparent' },
  resultsContainer: { alignItems: 'flex-end', marginTop: 8 },
  resultBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  profitBadge: { backgroundColor: Colors.profitBg },
  lossBadge: { backgroundColor: Colors.lossBg },
  resultValue: { fontSize: 16, fontWeight: '700' },
  profitText: { color: Colors.profit },
  lossText: { color: Colors.loss },
  eachWayContainer: { backgroundColor: Colors.background, borderRadius: 10, padding: 12, width: 150 },
  eachWayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  eachWayLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  eachWayValue: { fontSize: 14, fontWeight: '600' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  liquidityContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liquidityText: { fontSize: 12, color: Colors.textTertiary },
  kickoffTime: { fontSize: 12, color: Colors.textTertiary },
  anomalyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.warningBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  anomalyText: { fontSize: 11, color: Colors.warning, fontWeight: '600' },
});
