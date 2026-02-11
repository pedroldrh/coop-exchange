import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/use-auth';
import { useCreatePost } from '../../hooks/use-posts';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const createPostSchema = z.object({
  capacity_total: z
    .string()
    .min(1, 'Capacity is required')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 1, {
      message: 'Capacity must be at least 1',
    }),
  location: z.string().optional(),
  notes: z.string().optional(),
  max_value_hint: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'Must be a valid number',
    }),
});

type FormValues = {
  capacity_total: string;
  location: string;
  notes: string;
  max_value_hint: string;
};

type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

const colors = {
  primary: '#4F46E5',
  gray50: '#F9FAFB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

export function CreatePostScreen({ navigation }: Props) {
  const { user } = useAuth();
  const createPost = useCreatePost();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      capacity_total: '',
      location: '',
      notes: '',
      max_value_hint: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    const capacityTotal = parseInt(data.capacity_total, 10);
    const maxValueHint = data.max_value_hint
      ? parseFloat(data.max_value_hint)
      : null;

    try {
      await createPost.mutateAsync({
        capacity_total: capacityTotal,
        capacity_remaining: capacityTotal,
        location: data.location || null,
        notes: data.notes || null,
        max_value_hint: isNaN(maxValueHint as number) ? null : maxValueHint,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Failed to create post');
    }
  };

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
        <Text style={styles.heading}>Create a New Post</Text>
        <Text style={styles.subheading}>
          Let buyers know you are placing an order
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="capacity_total"
            rules={{ required: 'Capacity is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Total Capacity *"
                placeholder="How many orders can you take?"
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                error={errors.capacity_total?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Pickup Location"
                placeholder="Where will buyers pick up orders?"
                value={value}
                onChangeText={onChange}
                error={errors.location?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notes"
                placeholder="Any details about your order run..."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                error={errors.notes?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="max_value_hint"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Max Order Value ($)"
                placeholder="Optional max $ per order"
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                error={errors.max_value_hint?.message}
              />
            )}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Create Post"
              onPress={handleSubmit(onSubmit)}
              loading={createPost.isPending}
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
