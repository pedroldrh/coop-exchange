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
import { WebContainer } from '../../components/ui/WebContainer';
import { showAlert } from '../../lib/utils';
import { theme } from '../../lib/theme';

const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof editProfileSchema>;

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

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
    <WebContainer>
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
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginBottom: 28,
  },
  form: {
    gap: 0,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
