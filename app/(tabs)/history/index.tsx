import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  XCircle 
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { CompletedOpportunity, BOOKMAKER_NAMES } from '@/types';
import { formatCurrency, formatTime } from '@/utils/calculations';

function HistoryCard({ opportunity }: { opportunity: CompletedOpportunity }) {
  const isProfit = opportunity.qualifyingLoss >= 0;
  
  const statusConfig = {
    done: { icon: CheckCircle, color: Colors.profit, label: 'Completed' },
    odds_changed: { icon: AlertCircle, color: Colors.warning, label: 'Odds changed' },
    not_available: { icon: XCircle, color: Colors.loss, label: 'Not available' },
  };

  const status = statusConfig[opportunity.status];
  const StatusIcon = status.icon;

  return (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.teams} numberOfLines={1}>
            {opportunity.homeTeam} vs {opportunity.awayTeam}
          </Text>
          <Text style={styles.bookmaker}>
            {BOOKMAKER_NAMES[opportunity.bookmaker]} → Betfair
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <StatusIcon size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Back stake</Text>
          <Text style={styles.detailValue}>£{opportunity.backStake.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Lay stake</Text>
          <Text style={styles.detailValue}>£{opportunity.layStake.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Odds</Text>
          <Text style={styles.detailValue}>
            {opportunity.backOdds.toFixed(2)} / {opportunity.layOdds.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.timeInfo}>
          <Clock size={12} color={Colors.textTertiary} />
          <Text style={styles.timeText}>
            {formatTime(new Date(opportunity.completedAt))}
          </Text>
        </View>
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
  );
}

export default function HistoryScreen() {
  const { todayHistory, todayNet, sessionStats } = useApp();

  const totalStaked = useMemo(() => {
    return todayHistory.reduce((sum, h) => sum + h.backStake, 0);
  }, [todayHistory]);

  const completedCount = todayHistory.filter(h => h.status === 'done').length;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net Result</Text>
            <Text style={[
              styles.summaryValue,
              todayNet >= 0 ? styles.profitText : styles.lossText
            ]}>
              {formatCurrency(todayNet, true)}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Staked</Text>
            <Text style={styles.summaryValue}>£{totalStaked.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Completed</Text>
            <Text style={styles.summaryValue}>{completedCount}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>This Session</Text>
            <Text style={styles.summaryValue}>{sessionStats.currentSessionActions}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>

      {todayHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No activity today</Text>
          <Text style={styles.emptyText}>
            Completed bets will appear here
          </Text>
        </View>
      ) : (
        todayHistory.map(opportunity => (
          <HistoryCard key={opportunity.id} opportunity={opportunity} />
        ))
      )}
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
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    width: '45%',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  profitText: {
    color: Colors.profit,
  },
  lossText: {
    color: Colors.loss,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  teams: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  bookmaker: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  cardBody: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  profitBadge: {
    backgroundColor: Colors.profitBg,
  },
  lossBadge: {
    backgroundColor: Colors.lossBg,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
