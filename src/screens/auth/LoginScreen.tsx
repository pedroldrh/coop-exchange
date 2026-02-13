import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/use-auth';
import { EMAIL_DOMAIN } from '../../lib/constants';
import { showAlert } from '../../lib/utils';
import { theme } from '../../lib/theme';
import { WebContainer } from '../../components/ui/WebContainer';

export function LoginScreen() {
  const { signInWithPassword, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      showAlert('Error', 'Email is required');
      return;
    }
    if (!trimmedEmail.endsWith(`@${EMAIL_DOMAIN}`)) {
      showAlert('Error', `Email must end with @${EMAIL_DOMAIN}`);
      return;
    }
    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(trimmedEmail, password);
      } else {
        await signInWithPassword(trimmedEmail, password);
      }
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.tagline}>
              Give your meal swipes to other Gennies and get access to free food
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isSignUp
                ? 'Sign up with your W&L email'
                : 'Sign in to your account'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>{'\u2709'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`you@${EMAIL_DOMAIN}`}
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>{'\uD83D\uDD12'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onSubmitEditing={isSignUp ? undefined : onSubmit}
                />
              </View>
            </View>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>{'\uD83D\uDD12'}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                    onSubmitEditing={onSubmit}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={onSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                  : (isSignUp ? 'Create Account' : 'Sign In')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsSignUp(!isSignUp);
                setConfirmPassword('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleLink}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Washington and Lee University
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
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
    width: 180,
    height: 180,
    borderRadius: 90,
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
    width: 120,
    height: 120,
  },
  tagline: {
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
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  toggleLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 32,
    letterSpacing: 0.5,
  },
});
