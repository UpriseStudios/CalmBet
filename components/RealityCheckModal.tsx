import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { BarChart, Clock, AlertTriangle, TrendingUp, TrendingDown, Target } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatCurrency, formatDuration } from '@/utils/calculations';

export interface RealityCheckData {
  sessionDuration: number; // minutes
  totalStaked: number;
  netProfit: number;
  actionsCompleted: number;
}

interface RealityCheckModalProps {
  visible: boolean;
  data: RealityCheckData | null;
  onContinue: () => void;
  onTakeBreak: () => void;
}

const HOLD_DURATION = 5000; // 5 seconds

export default function RealityCheckModal({ 
  visible, 
  data, 
  onContinue, 
  onTakeBreak 
}: RealityCheckModalProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const handlePressIn = () => {
    setIsHolding(true);
  };

  const handlePressOut = () => {
    setIsHolding(false);
  };

  const openGambleAware = () => {
    Linking.openURL('https://www.begambleaware.org');
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress(prev => {
          const next = prev + 50;
          if (next >= HOLD_DURATION) {
            clearInterval(interval);
            onContinue();
            return HOLD_DURATION;
          }
          return next;
        });
      }, 50);
    } else {
      setHoldProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHolding, onContinue]);

  if (!data) return null;

  const { sessionDuration, totalStaked, netProfit, actionsCompleted } = data;
  const isProfit = netProfit >= 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Clock size={32} color={Colors.text} />
            <Text style={styles.title}>Reality Check</Text>
          </View>

          <Text style={styles.subtitle}>
            You've been active for {formatDuration(sessionDuration)}. Here's a summary of your session.
          </Text>

          <View style={styles.statsGrid}>
            <StatCard 
              icon={<Target size={24} color={Colors.accent} />} 
              label="Actions" 
              value={actionsCompleted.toString()}
            />
            <StatCard 
              icon={<BarChart size={24} color={Colors.accent} />} 
              label="Total Staked" 
              value={formatCurrency(totalStaked)}
            />
          </View>

          <View style={styles.profitCard}>
            <View>
              <Text style={styles.profitLabel}>Session Net Profit/Loss</Text>
              <Text style={[styles.profitValue, { color: isProfit ? Colors.profit : Colors.loss }]}>
                {isProfit ? '+' : ''}{formatCurrency(netProfit)}
              </Text>
            </View>
            {isProfit ? (
              <TrendingUp size={40} color={Colors.profit} />
            ) : (
              <TrendingDown size={40} color={Colors.loss} />
            )}
          </View>

          {netProfit < -50 && (
            <View style={styles.warningBox}>
              <AlertTriangle size={20} color={Colors.warning} />
              <Text style={styles.warningText}>You've lost over £50 this session. Consider taking a break.</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable style={styles.breakButton} onPress={onTakeBreak}>
              <Text style={styles.buttonText}>Take a 15-Min Break</Text>
            </Pressable>
            <Pressable 
              style={styles.continueButton}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <View style={[styles.holdProgress, { width: `${(holdProgress / HOLD_DURATION) * 100}%` }]} />
              <Text style={styles.buttonText}>Hold to Continue (5s)</Text>
            </Pressable>
          </View>
          
          <Pressable style={styles.supportLink} onPress={openGambleAware}>
            <Text style={styles.supportText}>Need support? Visit BeGambleAware.org</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statIcon: {
    marginRight: 12,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profitCard: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profitLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  profitValue: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    color: Colors.warning,
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  breakButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  holdProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.accent,
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  supportLink: {
    alignItems: 'center',
  },
  supportText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
