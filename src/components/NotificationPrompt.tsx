import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../lib/theme';

interface Props {
  visible: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export function NotificationPrompt({ visible, onEnable, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>{'\uD83D\uDD14'}</Text>
          <Text style={styles.title}>Turn on notifications</Text>
          <Text style={styles.body}>
            Get notified instantly when someone requests your swipes or accepts
            your food request. Without notifications, you might miss time-sensitive
            requests.
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
            onPress={onDismiss}
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
    marginBottom: 24,
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
