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
import { theme } from '../../lib/theme';
import { WebContainer } from '../../components/ui/WebContainer';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role_preference: z.enum(['buyer', 'seller'] as const, {
    message: 'Please select your role',
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const roles = [
  {
    value: 'seller' as const,
    label: 'Freshman',
    emoji: '\uD83C\uDF93',
    description: 'I have meal swipes to share',
  },
  {
    value: 'buyer' as const,
    label: 'Upperclassman',
    emoji: '\uD83C\uDF54',
    description: 'I want to request food',
  },
];

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
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>{'\uD83D\uDC4B'}</Text>
            </View>
            <Text style={styles.title}>Welcome to Swipe Share</Text>
            <Text style={styles.subtitle}>
              Let's set up your profile so others can find you
            </Text>
          </View>

          <View style={styles.card}>
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
                    <Text style={styles.inputIcon}>{'\uD83D\uDC64'}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Your name"
                      placeholderTextColor={theme.colors.textMuted}
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
                              <Text style={styles.checkMark}>{'\u2713'}</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: theme.colors.primary,
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
    color: theme.colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
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
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 10,
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
  inputWrapperError: {
    borderColor: theme.colors.danger,
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
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: theme.colors.danger,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.radius.xl,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  roleCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySurface,
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  roleLabelActive: {
    color: theme.colors.primary,
  },
  roleDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  roleDescActive: {
    color: theme.colors.primaryLight,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
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
});
