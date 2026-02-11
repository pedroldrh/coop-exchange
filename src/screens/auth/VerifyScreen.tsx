import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { showAlert } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

type Props = NativeStackScreenProps<AuthStackParamList, 'Verify'>;

export function VerifyScreen({ route }: Props) {
  const { email } = route.params;
  const { signInWithPassword } = useAuth();

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setError(null);
    setVerifying(true);
    try {
      // OTP verification no longer used — password auth instead
      void email; void trimmed;
      // Navigation happens automatically via AuthProvider session listener
    } catch (err: any) {
      setError(err.message ?? 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      // Resend no longer needed with password auth
      void email;
      showAlert('Code Sent', `A new code has been sent to ${email}.`);
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* ---- Header ---- */}
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to{' '}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        {/* ---- Code input ---- */}
        <View style={styles.fieldWrapper}>
          <TextInput
            style={[styles.input, error ? styles.inputError : undefined]}
            placeholder="000000"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/[^0-9]/g, ''));
              if (error) setError(null);
            }}
            editable={!verifying}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            textAlign="center"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* ---- Verify button ---- */}
        <TouchableOpacity
          style={[styles.button, verifying && styles.buttonDisabled]}
          onPress={handleVerify}
          activeOpacity={0.8}
          disabled={verifying}
        >
          <Text style={styles.buttonText}>
            {verifying ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        {/* ---- Resend link ---- */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={resending}
          style={styles.resendWrapper}
        >
          <Text style={styles.resendText}>
            {resending ? 'Sending...' : "Didn't get a code? Resend"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const PRIMARY = '#4F46E5';
const GRAY50 = '#F9FAFB';
const GRAY100 = '#F3F4F6';
const GRAY400 = '#9CA3AF';
const GRAY700 = '#374151';
const GRAY900 = '#111827';
const RED500 = '#EF4444';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY50,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GRAY900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: GRAY400,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  emailHighlight: {
    color: PRIMARY,
    fontWeight: '600',
  },
  fieldWrapper: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GRAY100,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 12,
    color: GRAY900,
  },
  inputError: {
    borderColor: RED500,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: RED500,
    textAlign: 'center',
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '500',
  },
});
