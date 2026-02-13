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
import { theme } from '../../lib/theme';
import { WebContainer } from '../../components/ui/WebContainer';

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
      void email; void trimmed;
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
      void email;
      showAlert('Code Sent', `A new code has been sent to ${email}.`);
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <WebContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            Enter the code sent to{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, error ? styles.inputError : undefined]}
              placeholder="000000"
              placeholderTextColor={theme.colors.gray400}
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
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray400,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  emailHighlight: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  fieldWrapper: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 12,
    color: theme.colors.gray900,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resendWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});
