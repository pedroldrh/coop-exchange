import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { theme } from '../lib/theme';

const GIVER_MESSAGES = [
  'just gave away my extra meal swipe on foodie instead of letting it go to waste',
  'gave away a meal swipe on the foodie app bc why would i let it expire lol',
  'just used foodie to give my extra dining swipe to someone who actually needed it, W app',
];

const RECEIVER_MESSAGES = [
  'someone just fed me for free on the foodie app, this is actually crazy',
  'just got a free meal through foodie, freshmen are actually goated for sharing their swipes',
  'bro i literally just got food for free on foodie, why is no one talking about this app',
];

interface FizzShareModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  role: 'giver' | 'receiver';
}

export function FizzShareModal({
  visible,
  onClose,
  requestId,
  role,
}: FizzShareModalProps) {
  const [dismissed, setDismissed] = useState(false);

  const storageKey = `fizz_shared_${requestId}`;

  const message = useMemo(() => {
    const pool = role === 'giver' ? GIVER_MESSAGES : RECEIVER_MESSAGES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [role]);

  // Check if already shown for this transaction
  useEffect(() => {
    if (!visible) return;
    AsyncStorage.getItem(storageKey).then((val) => {
      if (val) setDismissed(true);
    });
  }, [visible, storageKey]);

  const handleClose = async () => {
    await AsyncStorage.setItem(storageKey, '1');
    onClose();
  };

  const handleCopyAndOpen = async () => {
    await Clipboard.setStringAsync(message);
    await AsyncStorage.setItem(storageKey, '1');

    try {
      // Try deep link first, fall back to web
      const canOpen = await Linking.canOpenURL('fizz://');
      if (canOpen) {
        await Linking.openURL('fizz://');
      } else {
        await Linking.openURL('https://fizz.social');
      }
    } catch {
      // Link opening failed silently — message was already copied
    }

    onClose();
  };

  if (dismissed) return null;

  return (
    <Modal visible={visible} onClose={handleClose} title="Exchange Complete!">
      <View style={styles.content}>
        <Text style={styles.checkmark}>{'\u2705'}</Text>
        <Text style={styles.prompt}>
          Share on Fizz and help more students discover free food!
        </Text>

        <View style={styles.messageCard}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Copy & Open Fizz"
            onPress={handleCopyAndOpen}
            variant="primary"
            size="lg"
            fullWidth
          />
          <Button
            title="Maybe Later"
            onPress={handleClose}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 48,
    marginBottom: 12,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray700,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  messageCard: {
    width: '100%',
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.gray800,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
    gap: 8,
  },
});
