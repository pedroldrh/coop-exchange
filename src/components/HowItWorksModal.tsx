import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../lib/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: '\u2764\uFE0F',
    title: 'Share Your Swipes',
    body: 'Have extra meal swipes? Tap the heart button on the Feed and choose how many swipes you want to share.',
  },
  {
    icon: '\uD83C\uDF54',
    title: 'Request Food',
    body: 'See someone sharing swipes? Tap their post, pick a location (Coop or E-Cafe), choose your items from the menu, and submit your request.',
  },
  {
    icon: '\u2705',
    title: 'Accept & Order',
    body: 'If you\'re the sharer, you\'ll get a notification when someone requests. Accept it, then tap the button to open the mobile order app and place the order.',
  },
  {
    icon: '\uD83D\uDCF2',
    title: 'Pick Up Your Food',
    body: 'Buyers get notified when the order is placed and when it\'s ready. Head to the location and pick up your food!',
  },
  {
    icon: '\u2B50',
    title: 'Rate & Earn Badges',
    body: 'After the order is complete, rate each other. Complete more orders to climb the leaderboard and earn badges!',
  },
];

export function HowItWorksModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>How Foodie Works</Text>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {STEPS.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepHeader}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                  </View>
                  <Text style={styles.stepNumber}>Step {i + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.closeText}>Got it!</Text>
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
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.xxl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...theme.shadow.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    flexGrow: 0,
  },
  step: {
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepIcon: {
    fontSize: 18,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    marginLeft: 46,
  },
  stepBody: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginLeft: 46,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  closeText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
