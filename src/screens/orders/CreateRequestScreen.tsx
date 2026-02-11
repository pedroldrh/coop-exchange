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
import { useCreateRequest } from '../../hooks/use-requests';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ItemsInput } from '../../components/ItemsInput';

const createRequestSchema = z.object({
  items_text: z.string().min(1, 'Items are required'),
  instructions: z.string().optional(),
  est_total: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val), {
      message: 'Must be a valid number',
    }),
});

type FormValues = {
  items_text: string;
  instructions: string;
  est_total: string;
};

type Props = NativeStackScreenProps<FeedStackParamList, 'CreateRequest'>;

const colors = {
  primary: '#4F46E5',
  gray50: '#F9FAFB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

export function CreateRequestScreen({ route, navigation }: Props) {
  const { postId, sellerId } = route.params;
  const { user } = useAuth();
  const createRequest = useCreateRequest();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      items_text: '',
      instructions: '',
      est_total: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    const estTotal = data.est_total ? parseFloat(data.est_total) : null;

    try {
      const result = await createRequest.mutateAsync({
        post_id: postId,
        seller_id: sellerId,
        items_text: data.items_text,
        instructions: data.instructions || null,
        est_total: isNaN(estTotal as number) ? null : estTotal,
        paid_proof_path: null,
        paid_reference: null,
        ordered_proof_path: null,
        order_id_text: null,
        buyer_completed: false,
        seller_completed: false,
        cancel_reason: null,
        cancelled_by: null,
      });
      navigation.navigate('OrderDetail', { requestId: result.id });
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Failed to submit request');
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
        <Text style={styles.heading}>Request an Order</Text>
        <Text style={styles.subheading}>
          Tell the seller what you need them to order for you
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="items_text"
            rules={{ required: 'Items are required' }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Items *</Text>
                <ItemsInput value={value} onChangeText={onChange} />
                {errors.items_text && (
                  <Text style={styles.errorText}>
                    {errors.items_text.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="instructions"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Special Instructions"
                placeholder="Any preferences, substitutions, etc."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                error={errors.instructions?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="est_total"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Estimated Total ($)"
                placeholder="Approximate cost of your items"
                value={value}
                onChangeText={onChange}
                keyboardType="decimal-pad"
                error={errors.est_total?.message}
              />
            )}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Submit Request"
              onPress={handleSubmit(onSubmit)}
              loading={createRequest.isPending}
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
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
