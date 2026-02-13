import React, { useState } from 'react';
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
import type { FeedStackParamList } from '../../types/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/use-auth';
import { useCreatePost } from '../../hooks/use-posts';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { WebContainer } from '../../components/ui/WebContainer';
import { showAlert } from '../../lib/utils';
import { theme } from '../../lib/theme';
import { LOCATIONS, type LocationKey } from '../../lib/menu';

type FormValues = {
  capacity_total: string;
  notes: string;
  max_value_hint: string;
};

type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

export function CreatePostScreen({ navigation }: Props) {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const [selectedLocation, setSelectedLocation] = useState<LocationKey | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      capacity_total: '',
      notes: '',
      max_value_hint: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    if (!selectedLocation) {
      showAlert('Error', 'Please select a pickup location');
      return;
    }

    const capacityTotal = parseInt(data.capacity_total, 10);
    const maxValueHint = data.max_value_hint
      ? parseFloat(data.max_value_hint)
      : null;

    try {
      await createPost.mutateAsync({
        capacity_total: capacityTotal,
        capacity_remaining: capacityTotal,
        location: selectedLocation,
        notes: data.notes || null,
        max_value_hint: isNaN(maxValueHint as number) ? null : maxValueHint,
      });
      navigation.goBack();
    } catch (error: any) {
      showAlert('Error', error?.message ?? 'Failed to create post');
    }
  };

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
          <Text style={styles.heading}>Share Your Swipes</Text>
          <Text style={styles.subheading}>
            Let others know you have meal swipes to share
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="capacity_total"
              rules={{ required: 'Capacity is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Total Capacity *"
                  placeholder="How many meals can you get?"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                  error={errors.capacity_total?.message}
                />
              )}
            />

            <View style={styles.locationSection}>
              <Text style={styles.locationLabel}>Pickup Location *</Text>
              <View style={styles.locationButtons}>
                {(Object.keys(LOCATIONS) as LocationKey[]).map((key) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.locationChip,
                      selectedLocation === key && styles.locationChipActive,
                    ]}
                    onPress={() => setSelectedLocation(key)}
                  >
                    <Text
                      style={[
                        styles.locationChipText,
                        selectedLocation === key && styles.locationChipTextActive,
                      ]}
                    >
                      {LOCATIONS[key].label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

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

            <View style={styles.buttonContainer}>
              <Button
                title="Share Swipes"
                onPress={handleSubmit(onSubmit)}
                loading={createPost.isPending}
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
  locationSection: {
    marginBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
    marginBottom: 8,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  locationChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  locationChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySurface,
  },
  locationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray500,
  },
  locationChipTextActive: {
    color: theme.colors.primary,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
