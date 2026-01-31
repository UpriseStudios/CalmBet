import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TrendingUp, TrendingDown, Clock, Droplets } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { CalculatedOpportunity, BOOKMAKER_NAMES, Bookmaker } from '@/types';
import { formatCurrency, formatTime, getTimeUntilKickoff } from '@/utils/calculations';

interface OpportunityCardProps {
  opportunity: CalculatedOpportunity;
  onPress: () => void;
}

const BOOKMAKER_COLORS: Record<Bookmaker, string> = {
  bet365: Colors.bet365,
  skybet: Colors.skybet,
  williamhill: Colors.williamhill,
  paddypower: Colors.paddypower,
  ladbrokes: Colors.ladbrokes,
};

export default function OpportunityCard({ opportunity, onPress }: OpportunityCardProps) {
  const isProfit = opportunity.qualifyingLoss >= 0;
  const timeUntil = getTimeUntilKickoff(opportunity.kickoff);

  return (
    <Pressable 
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.matchInfo}>
          <Text style={styles.teams} numberOfLines={1}>
            {opportunity.homeTeam} vs {opportunity.awayTeam}
          </Text>
          <Text style={styles.competition}>{opportunity.competition}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={12} color={Colors.textSecondary} />
          <Text style={styles.time}>{timeUntil}</Text>
        </View>
      </View>

      <View style={styles.oddsRow}>
        <View style={styles.oddsBlock}>
          <View style={[styles.bookmakerBadge, { backgroundColor: BOOKMAKER_COLORS[opportunity.bookmaker] + '20' }]}>
            <View style={[styles.bookmakerDot, { backgroundColor: BOOKMAKER_COLORS[opportunity.bookmaker] }]} />
            <Text style={[styles.bookmakerName, { color: BOOKMAKER_COLORS[opportunity.bookmaker] }]}>
              {BOOKMAKER_NAMES[opportunity.bookmaker]}
            </Text>
          </View>
          <Text style={styles.oddsLabel}>Back</Text>
          <Text style={styles.oddsValue}>{opportunity.backOdds.toFixed(2)}</Text>
        </View>

        <View style={styles.arrowContainer}>
          <View style={styles.arrowLine} />
          <View style={styles.arrowHead} />
        </View>

        <View style={styles.oddsBlock}>
          <View style={[styles.bookmakerBadge, { backgroundColor: Colors.betfair + '20' }]}>
            <View style={[styles.bookmakerDot, { backgroundColor: Colors.betfair }]} />
            <Text style={[styles.bookmakerName, { color: Colors.betfair }]}>Betfair</Text>
          </View>
          <Text style={styles.oddsLabel}>Lay</Text>
          <Text style={styles.oddsValue}>{opportunity.layOdds.toFixed(2)}</Text>
        </View>

        <View style={styles.resultBlock}>
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
              {formatCurrency(opportunity.qualifyingLoss, true)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.liquidityContainer}>
          <Droplets size={12} color={Colors.textTertiary} />
          <Text style={styles.liquidityText}>
            £{opportunity.liquidity.toLocaleString()} available
          </Text>
        </View>
        <Text style={styles.kickoffTime}>
          {formatTime(opportunity.kickoff)}
        </Text>
      </View>
    </Pressable>
  );
}

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
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  teams: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  competition: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  time: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  oddsBlock: {
    flex: 1,
  },
  bookmakerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
    gap: 4,
  },
  bookmakerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bookmakerName: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  oddsLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  oddsValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 20,
  },
  arrowLine: {
    width: 16,
    height: 2,
    backgroundColor: Colors.cardBorder,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: Colors.cardBorder,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  resultBlock: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    marginTop: 20,
  },
  profitBadge: {
    backgroundColor: Colors.profitBg,
  },
  lossBadge: {
    backgroundColor: Colors.lossBg,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  profitText: {
    color: Colors.profit,
  },
  lossText: {
    color: Colors.loss,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  liquidityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liquidityText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  kickoffTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
