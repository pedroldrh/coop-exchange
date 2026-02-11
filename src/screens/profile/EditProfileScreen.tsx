import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/use-auth';
import { useProfile, useUpdateProfile } from '../../hooks/use-profile';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { showAlert } from '../../lib/utils';

const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role_preference: z.enum(['buyer', 'seller']),
});

type FormValues = z.infer<typeof editProfileSchema>;

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const colors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

const roleOptions: { label: string; value: 'buyer' | 'seller' }[] = [
  { label: 'Upperclassman', value: 'buyer' },
  { label: 'Freshman', value: 'seller' },
];

export function EditProfileScreen({ navigation }: Props) {
  const { refreshProfile } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      role_preference: 'buyer',
    },
    resolver: zodResolver(editProfileSchema) as any,
  });

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? '',
        role_preference:
          profile.role_preference === 'admin'
            ? 'buyer'
            : (profile.role_preference as 'buyer' | 'seller'),
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        role_preference: data.role_preference,
      });
      await refreshProfile();
      navigation.goBack();
    } catch (err: any) {
      showAlert('Error', err?.message ?? 'Failed to update profile');
    }
  };

  if (isLoading || !profile) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Edit Profile</Text>
        <Text style={styles.subheading}>Update your account information</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Name *"
                placeholder="Your display name"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="role_preference"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Role Preference</Text>
                <View style={styles.roleSelector}>
                  {roleOptions.map((option) => {
                    const isSelected = value === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        style={[
                          styles.roleOption,
                          isSelected && styles.roleOptionSelected,
                        ]}
                        onPress={() => onChange(option.value)}
                      >
                        <Text
                          style={[
                            styles.roleOptionText,
                            isSelected && styles.roleOptionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {errors.role_preference && (
                  <Text style={styles.errorText}>
                    {errors.role_preference.message}
                  </Text>
                )}
              </View>
            )}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSubmit(onSubmit)}
              loading={updateProfile.isPending}
              fullWidth
              size="lg"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 28,
  },
  form: {
    gap: 0,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: 6,
  },
  roleSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    overflow: 'hidden',
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  roleOptionSelected: {
    backgroundColor: colors.primary,
  },
  roleOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray700,
  },
  roleOptionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
