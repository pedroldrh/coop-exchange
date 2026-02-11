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
    message: 'Please select your role',
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/* ------------------------------------------------------------------ */
/* Role option data                                                    */
/* ------------------------------------------------------------------ */

const roles = [
  {
    value: 'seller' as const,
    label: 'Freshman',
    emoji: '🎓',
    description: 'I have meal swipes to share',
  },
  {
    value: 'buyer' as const,
    label: 'Upperclassman',
    emoji: '🍔',
    description: 'I want to request food',
  },
];

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
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name.trim(),
          role_preference: data.role_preference,
        })
        .eq('id', user.id)
        .select();

      if (error) throw error;

      await refreshProfile();
    } catch (err: any) {
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>👋</Text>
          </View>
          <Text style={styles.title}>Welcome to Swipe Share</Text>
          <Text style={styles.subtitle}>
            Let's set up your profile so others can find you
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>What's your name?</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputWrapper,
                    errors.name && styles.inputWrapperError,
                  ]}
                >
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="#A0AEC0"
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    editable={!submitting}
                  />
                </View>
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>

          {/* Role Preference */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>I am a...</Text>
            <Controller
              control={control}
              name="role_preference"
              render={({ field: { onChange, value } }) => (
                <View style={styles.roleGrid}>
                  {roles.map((role) => {
                    const isSelected = value === role.value;
                    return (
                      <TouchableOpacity
                        key={role.value}
                        style={[
                          styles.roleCard,
                          isSelected && styles.roleCardActive,
                        ]}
                        onPress={() => onChange(role.value)}
                        disabled={submitting}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.roleEmoji}>{role.emoji}</Text>
                        <Text
                          style={[
                            styles.roleLabel,
                            isSelected && styles.roleLabelActive,
                          ]}
                        >
                          {role.label}
                        </Text>
                        <Text
                          style={[
                            styles.roleDesc,
                            isSelected && styles.roleDescActive,
                          ]}
                        >
                          {role.description}
                        </Text>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Text style={styles.checkMark}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />
            {errors.role_preference && (
              <Text style={styles.errorText}>
                {errors.role_preference.message}
              </Text>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Setting up...' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

const PRIMARY = '#4F46E5';
const BG = '#F0F2F8';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#1A202C';
const TEXT_SECONDARY = '#718096';
const INPUT_BG = '#F7FAFC';
const INPUT_BORDER = '#E2E8F0';
const RED500 = '#EF4444';

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },

  /* Card */
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },

  /* Inputs */
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_BG,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: RED500,
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
    color: TEXT_PRIMARY,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: RED500,
  },

  /* Role cards */
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: INPUT_BG,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  roleCardActive: {
    borderColor: PRIMARY,
    backgroundColor: '#EEF2FF',
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  roleLabelActive: {
    color: PRIMARY,
  },
  roleDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 16,
  },
  roleDescActive: {
    color: '#6366F1',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Submit */
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
