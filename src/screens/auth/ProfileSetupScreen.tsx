import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/use-auth';
import { supabase } from '../../lib/supabase';

/* ------------------------------------------------------------------ */
/* Validation schema                                                   */
/* ------------------------------------------------------------------ */

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  venmo_handle: z
    .string()
    .min(1, 'Venmo handle is required')
    .regex(/^@/, 'Venmo handle must start with @'),
  role_preference: z.enum(['buyer', 'seller'] as const, {
    message: 'Please select a role preference',
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export function ProfileSetupScreen() {
  const { user, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      venmo_handle: '@',
      role_preference: 'buyer',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email!,
        name: data.name.trim(),
        venmo_handle: data.venmo_handle.trim(),
        role_preference: data.role_preference,
      });

      if (error) throw error;

      await refreshProfile();
      // Navigation happens automatically via RootNavigator
      // when profileComplete becomes true
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---- Header ---- */}
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>
          Tell us a bit about yourself so others can find you.
        </Text>

        {/* ---- Name ---- */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Your full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                editable={!submitting}
              />
            )}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}
        </View>

        {/* ---- Venmo Handle ---- */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Venmo Handle</Text>
          <Controller
            control={control}
            name="venmo_handle"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  errors.venmo_handle && styles.inputError,
                ]}
                placeholder="@your-venmo"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={onBlur}
                onChangeText={(text) => {
                  // Ensure the @ prefix is always present
                  if (!text.startsWith('@')) {
                    onChange('@' + text.replace(/@/g, ''));
                  } else {
                    onChange(text);
                  }
                }}
                value={value}
                editable={!submitting}
              />
            )}
          />
          {errors.venmo_handle && (
            <Text style={styles.errorText}>{errors.venmo_handle.message}</Text>
          )}
        </View>

        {/* ---- Role Preference ---- */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Role Preference</Text>
          <Controller
            control={control}
            name="role_preference"
            render={({ field: { onChange, value } }) => (
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    value === 'buyer' && styles.roleOptionActive,
                  ]}
                  onPress={() => onChange('buyer')}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleText,
                      value === 'buyer' && styles.roleTextActive,
                    ]}
                  >
                    Buyer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    value === 'seller' && styles.roleOptionActive,
                  ]}
                  onPress={() => onChange('seller')}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleText,
                      value === 'seller' && styles.roleTextActive,
                    ]}
                  >
                    Seller
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.role_preference && (
            <Text style={styles.errorText}>
              {errors.role_preference.message}
            </Text>
          )}
        </View>

        {/* ---- Submit button ---- */}
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.8}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Saving...' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const PRIMARY = '#4F46E5';
const GRAY50 = '#F9FAFB';
const GRAY100 = '#F3F4F6';
const GRAY200 = '#E5E7EB';
const GRAY400 = '#9CA3AF';
const GRAY700 = '#374151';
const GRAY900 = '#111827';
const RED500 = '#EF4444';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY50,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
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
    marginBottom: 36,
    lineHeight: 22,
  },
  fieldWrapper: {
    marginBottom: 20,
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
    borderColor: GRAY200,
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
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: GRAY200,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleOptionActive: {
    borderColor: PRIMARY,
    backgroundColor: '#EEF2FF',
  },
  roleText: {
    fontSize: 16,
    fontWeight: '500',
    color: GRAY700,
  },
  roleTextActive: {
    color: PRIMARY,
    fontWeight: '600',
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
