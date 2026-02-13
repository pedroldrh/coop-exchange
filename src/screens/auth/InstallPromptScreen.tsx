import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../lib/theme';
import { WebContainer } from '../../components/ui/WebContainer';

const isIOS =
  Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

interface Props {
  onDismiss: () => void;
}

export function InstallPromptScreen({ onDismiss }: Props) {
  const handleContinue = async () => {
    await AsyncStorage.setItem('install_prompt_seen', 'true');
    onDismiss();
  };

  return (
    <WebContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Get the Foodie App</Text>
          <Text style={styles.subtitle}>
            Add Foodie to your home screen for the best experience
          </Text>
        </View>

        <View style={styles.card}>
          {isIOS ? (
            <>
              <Text style={styles.stepTitle}>How to install on iPhone:</Text>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>
                  Tap the <Text style={styles.bold}>Share button</Text> at the
                  bottom of Safari (the square with an arrow pointing up)
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Scroll down and tap{' '}
                  <Text style={styles.bold}>Add to Home Screen</Text>
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  Tap <Text style={styles.bold}>Add</Text> in the top right
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>How to install:</Text>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>
                  Tap the <Text style={styles.bold}>three dots menu</Text> in
                  the top right of Chrome
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Tap{' '}
                  <Text style={styles.bold}>Add to Home Screen</Text> or{' '}
                  <Text style={styles.bold}>Install app</Text>
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  Tap <Text style={styles.bold}>Install</Text> to confirm
                </Text>
              </View>
            </>
          )}

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>{'\uD83D\uDD14'}</Text>
            <Text style={styles.benefitText}>
              Get push notifications when someone requests your swipes
            </Text>
          </View>

          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>{'\u26A1'}</Text>
            <Text style={styles.benefitText}>
              Opens instantly like a real app — no browser bar
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>
      </ScrollView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.xxl,
    padding: 24,
    ...theme.shadow.lg,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.inputBorder,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
