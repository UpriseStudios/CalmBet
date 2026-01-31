import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Shield, Moon, AlertTriangle, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Nudge, NudgeType } from '@/contexts/HarmMinimisationContext';

interface NudgeModalProps {
  nudge: Nudge | null;
  visible: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  onDismiss: () => void;
}

const NUDGE_ICONS: Record<NudgeType, React.ReactNode> = {
  session: <Clock size={32} color={Colors.accent} />,
  late_night: <Moon size={32} color={Colors.warning} />,
  stake_limit: <AlertTriangle size={32} color={Colors.warning} />,
  daily_limit: <Shield size={32} color={Colors.loss} />,
};

export default function NudgeModal({ 
  nudge, 
  visible, 
  onPrimaryAction, 
  onSecondaryAction,
  onDismiss 
}: NudgeModalProps) {
  if (!nudge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            {NUDGE_ICONS[nudge.type]}
          </View>
          
          <Text style={styles.title}>{nudge.title}</Text>
          <Text style={styles.message}>{nudge.message}</Text>

          <View style={styles.actions}>
            <Pressable 
              style={[styles.button, styles.primaryButton]}
              onPress={onPrimaryAction}
            >
              <Text style={styles.primaryButtonText}>{nudge.primaryAction}</Text>
            </Pressable>
            
            {nudge.secondaryAction && (
              <Pressable 
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondaryAction}
              >
                <Text style={styles.secondaryButtonText}>{nudge.secondaryAction}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.accent,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundTertiary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
