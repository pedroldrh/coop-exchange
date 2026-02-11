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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { EMAIL_DOMAIN } from '../../lib/constants';
import { showAlert } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/* Validation schema                                                   */
/* ------------------------------------------------------------------ */

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .refine(
      (val) => val.trim().toLowerCase().endsWith(`@${EMAIL_DOMAIN}`),
      `Email must end with @${EMAIL_DOMAIN}`,
    ),
});

type LoginFormData = z.infer<typeof loginSchema>;

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [sending, setSending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  });

  const isWeb = Platform.OS === 'web';
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    const email = data.email.trim().toLowerCase();
    setSending(true);
    try {
      await signIn(email);
      if (isWeb) {
        setEmailSent(true);
      } else {
        navigation.navigate('Verify', { email });
      }
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Failed to send code. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* ---- Branding ---- */}
        <Text style={styles.title}>Swipe Share</Text>

        {emailSent ? (
          <View style={styles.sentContainer}>
            <Text style={styles.sentIcon}>&#9993;</Text>
            <Text style={styles.sentTitle}>Check your email!</Text>
            <Text style={styles.sentText}>
              We sent a magic link to your email. Click the link in the email to sign in.
              This page will update automatically.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#6B7280', marginTop: 24 }]}
              onPress={() => setEmailSent(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Try a different email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Sign in with your W&L email to get started.
            </Text>

            {/* ---- Email input ---- */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder={`you@${EMAIL_DOMAIN}`}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="send"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!sending}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            {/* ---- Submit button ---- */}
            <TouchableOpacity
              style={[styles.button, sending && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.8}
              disabled={sending}
            >
              <Text style={styles.buttonText}>
                {sending ? 'Sending...' : 'Send Code'}
              </Text>
            </TouchableOpacity>
          </>
        )}
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
    fontSize: 32,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: GRAY400,
    textAlign: 'center',
    marginBottom: 40,
  },
  fieldWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GRAY100,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: GRAY900,
  },
  inputError: {
    borderColor: RED500,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: RED500,
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
  sentContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sentIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  sentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: GRAY900,
    marginBottom: 8,
  },
  sentText: {
    fontSize: 15,
    color: GRAY400,
    textAlign: 'center',
    lineHeight: 22,
  },
});
