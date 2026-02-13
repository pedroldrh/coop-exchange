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
  const { sendCode, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      showAlert('Error', 'Email is required');
      return;
    }
    if (!trimmedEmail.endsWith(`@${EMAIL_DOMAIN}`)) {
      showAlert('Error', `Email must end with @${EMAIL_DOMAIN}`);
      return;
    }

    setLoading(true);
    try {
      await sendCode(trimmedEmail);
      setSent(true);
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async () => {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      showAlert('Error', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyCode(email.trim().toLowerCase(), trimmed);
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setLoading(true);
    try {
      await sendCode(email.trim().toLowerCase());
      showAlert('Code Sent', 'A new code has been sent to your email.');
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Failed to resend code');
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
            <Text style={styles.mission}>
              Making the swipe system more efficient and saving money for students already paying $90k to be here.
            </Text>
          </View>

          {sent ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Enter Code</Text>
              <Text style={styles.cardSubtitle}>
                We sent a 6-digit code to{' '}
                <Text style={styles.emailHighlight}>
                  {email.trim().toLowerCase()}
                </Text>
              </Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="000000"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
                  editable={!loading}
                  onSubmitEditing={onVerifyCode}
                  textAlign="center"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={onVerifyCode}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity onPress={onResend} disabled={loading} activeOpacity={0.7}>
                  <Text style={styles.linkText}>Resend code</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSent(false);
                    setEmail('');
                    setCode('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>Use a different email</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome</Text>
              <Text style={styles.cardSubtitle}>
                Sign in with your W&L email
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
                    onSubmitEditing={onSendCode}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={onSendCode}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Sending Code...' : 'Send Code'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.anonNotice}>
            <Text style={styles.anonIcon}>{'\uD83D\uDD75'}</Text>
            <Text style={styles.anonText}>
              Your identity is always anonymous. You'll be assigned a random nickname so no one knows who you are.
            </Text>
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
  mission: {
    fontSize: 13,
    color: theme.colors.primary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 10,
    fontWeight: '600',
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
  emailHighlight: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  codeInput: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 12,
    color: theme.colors.textPrimary,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
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
  anonNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginTop: 16,
    gap: 10,
    ...theme.shadow.sm,
  },
  anonIcon: {
    fontSize: 20,
  },
  anonText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 32,
    letterSpacing: 0.5,
  },
});
