import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../lib/theme';

const DISMISS_KEY = 'notif_prompt_dismissed_at';
const DISMISS_DAYS = 7;

interface Props {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export function NotificationPrompt({ visible, onEnable, onDismiss }: Props) {
  const [suppressed, setSuppressed] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DISMISS_KEY).then((val) => {
      if (!val) return;
      const dismissedAt = parseInt(val, 10);
      const elapsed = Date.now() - dismissedAt;
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
        setSuppressed(true);
      }
    });
  }, []);

  const handleDismiss = () => {
    AsyncStorage.setItem(DISMISS_KEY, String(Date.now()));
    setSuppressed(true);
    onDismiss();
  };

  return (
    <Modal visible={visible && !suppressed} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>{'\uD83D\uDEA8'}</Text>
          <Text style={styles.title}>You NEED notifications on</Text>
          <Text style={styles.body}>
            This is how you'll know when someone requests your swipes or when
            your food request gets accepted.
          </Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              If you don't allow notifications, you{' '}
              <Text style={styles.warningBold}>will miss requests</Text> and
              won't know when someone needs your help or when your food is ready.
            </Text>
          </View>
          <Text style={styles.instruction}>
            We won't bombard you — you'll only get notified when something
            needs your attention. Tap "Enable" below, then tap{' '}
            <Text style={styles.instructionBold}>"Allow"</Text> on the next
            popup.
          </Text>

          <TouchableOpacity
            style={styles.enableButton}
            onPress={onEnable}
            activeOpacity={0.85}
          >
            <Text style={styles.enableText}>Enable Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.laterText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.xxl,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...theme.shadow.lg,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 19,
  },
  warningBold: {
    fontWeight: '700',
  },
  instruction: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  instructionBold: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  enableButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  enableText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  laterButton: {
    paddingVertical: 8,
  },
  laterText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
