import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '../../lib/theme';
import { WebContainer } from '../../components/ui/WebContainer';

const isIOS =
  Platform.OS === 'web' &&
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

interface Props {
  onDismiss: () => void;
}

export function InstallPromptScreen({ onDismiss: _onDismiss }: Props) {
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
          <Text style={styles.title}>One More Step!</Text>
          <Text style={styles.subtitle}>
            You need to add Foodie to your home screen to use the app.
            This is required to receive notifications when someone
            requests or accepts your swipes.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>{'\uD83D\uDD14'}</Text>
          <Text style={styles.warningText}>
            Without adding to home screen, you{' '}
            <Text style={styles.bold}>won't get notifications</Text> and
            may miss swipe requests.
          </Text>
        </View>

        <View style={styles.card}>
          {isIOS ? (
            <>
              <Text style={styles.stepTitle}>Follow these steps:</Text>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>
                  Tap the{' '}
                  <Text style={styles.bold}>three dots menu (...)</Text> at the
                  bottom right of your screen
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>2</Text>
                <Text style={styles.stepText}>
                  Tap the <Text style={styles.bold}>Share button</Text> (the
                  square with an arrow pointing up)
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>3</Text>
                <Text style={styles.stepText}>
                  Scroll down and tap{' '}
                  <Text style={styles.bold}>Add to Home Screen</Text>
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>
                  Tap <Text style={styles.bold}>Add</Text> in the top right
                </Text>
              </View>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>5</Text>
                <Text style={styles.stepText}>
                  Open <Text style={styles.bold}>Foodie</Text> from your home
                  screen and sign in
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.stepTitle}>Follow these steps:</Text>

              <View style={styles.step}>
                <Text style={styles.stepNumber}>1</Text>
                <Text style={styles.stepText}>
                  Tap the{' '}
                  <Text style={styles.bold}>three dots menu (...)</Text> at the
                  bottom right of your screen
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

              <View style={styles.step}>
                <Text style={styles.stepNumber}>4</Text>
                <Text style={styles.stepText}>
                  Open <Text style={styles.bold}>Foodie</Text> from your home
                  screen and sign in
                </Text>
              </View>
            </>
          )}
        </View>
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
    marginBottom: 24,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  warningIcon: {
    fontSize: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
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
});
