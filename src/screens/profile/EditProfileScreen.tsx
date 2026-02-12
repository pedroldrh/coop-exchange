import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
    },
    resolver: zodResolver(editProfileSchema) as any,
  });

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
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
  buttonContainer: {
    marginTop: 8,
  },
});
