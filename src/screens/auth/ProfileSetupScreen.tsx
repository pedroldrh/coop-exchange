import React, { useState } from 'react';
import {
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
import { showAlert } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/* Validation schema                                                   */
/* ------------------------------------------------------------------ */

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
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
      role_preference: 'buyer',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      console.warn('[ProfileSetup] onSubmit called but user is null');
      return;
    }

    console.log('[ProfileSetup] onSubmit: updating profile for', user.id, data);
    setSubmitting(true);
    try {
      const { error, data: updateResult } = await supabase
        .from('profiles')
        .update({
          name: data.name.trim(),
          role_preference: data.role_preference,
        })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('[ProfileSetup] Supabase update error:', error);
        throw error;
      }

      console.log('[ProfileSetup] Update succeeded, result:', updateResult);
      console.log('[ProfileSetup] Calling refreshProfile...');
      await refreshProfile();
      console.log('[ProfileSetup] refreshProfile completed, navigation should happen automatically');
      // Navigation happens automatically via RootNavigator
      // when profileComplete becomes true
    } catch (err: any) {
      console.error('[ProfileSetup] onSubmit error:', err);
      showAlert('Error', err.message ?? 'Failed to save profile.');
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
          Tell us a bit about yourself.
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
                placeholder="Your name"
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
                    Upperclassman
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
                    Freshman
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
