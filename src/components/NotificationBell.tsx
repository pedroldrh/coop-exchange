import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../lib/theme';

const DISMISS_KEY = 'install-prompt-dismissed';

type InstallPlatform = 'ios' | 'android' | 'desktop';

function detectPlatform(): InstallPlatform {
  if (Platform.OS !== 'web') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (Platform.OS !== 'web') return false;
  if ((window.navigator as any).standalone) return true; // iOS Safari
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  return false;
}

const INSTRUCTIONS: Record<InstallPlatform, { icon: string; text: string }> = {
  ios: {
    icon: '\uD83D\uDCF1',
    text: 'Tap the Share button (\u2B06\uFE0F), then "Add to Home Screen"',
  },
  android: {
    icon: '\uD83D\uDCF1',
    text: 'Tap the \u22EE menu, then "Install app" or "Add to Home Screen"',
  },
  desktop: {
    icon: '\uD83D\uDDA5\uFE0F',
    text: 'Click the install icon (\u2295) in the address bar',
  },
};

export function NotificationBell() {
  const [dismissed, setDismissed] = useState(true); // start hidden
  const [standalone, setStandalone] = useState(true); // start hidden
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const platform = useMemo(detectPlatform, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const pwaMode = isStandalone();
    setStandalone(pwaMode);
    if (pwaMode) return;

    AsyncStorage.getItem(DISMISS_KEY).then((val) => {
      setDismissed(val === 'true');
    });
  }, []);

  const showInstallCard = !standalone && !dismissed;

  const handleDismiss = useCallback(async () => {
    await AsyncStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
    setDropdownOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  // Don't render on non-web platforms
  if (Platform.OS !== 'web') return null;

  const info = INSTRUCTIONS[platform];

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={toggleDropdown}
        style={styles.bellButton}
        hitSlop={8}
      >
        <Text style={styles.bellIcon}>{'\uD83D\uDD14'}</Text>
        {showInstallCard && <View style={styles.badge}><Text style={styles.badgeText}>1</Text></View>}
      </Pressable>

      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setDropdownOpen(false)}
        >
          <Pressable style={styles.dropdown} onPress={() => {}}>
            {showInstallCard ? (
              <View style={styles.installCard}>
                <Text style={styles.installIcon}>{info.icon}</Text>
                <Text style={styles.installTitle}>Download the app</Text>
                <Text style={styles.installText}>{info.text}</Text>
                <Pressable
                  style={styles.gotItButton}
                  onPress={handleDismiss}
                >
                  <Text style={styles.gotItText}>Got it</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>{'\u2705'}</Text>
                <Text style={styles.emptyText}>No new notifications</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  bellButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  bellIcon: {
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  dropdown: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    width: '90%',
    maxWidth: 340,
    ...theme.shadow.lg,
  },
  installCard: {
    padding: 20,
    alignItems: 'center',
  },
  installIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  installTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  installText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  gotItButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  gotItText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
