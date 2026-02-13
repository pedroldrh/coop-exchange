import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { useCreateRequest } from '../../hooks/use-requests';
import { MenuPicker } from '../../components/MenuPicker';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { WebContainer } from '../../components/ui/WebContainer';
import { CAFE_77_MENU } from '../../lib/menu';
import { SWIPE_VALUE } from '../../lib/constants';
import { showAlert } from '../../lib/utils';
import { theme } from '../../lib/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'CreateRequest'>;

export function CreateRequestScreen({ route, navigation }: Props) {
  const { postId, sellerId } = route.params;
  const { user } = useAuth();
  const createRequest = useCreateRequest();

  const [selections, setSelections] = useState<Record<string, number>>({});
  const [instructions, setInstructions] = useState('');

  const total = useMemo(() => {
    let sum = 0;
    for (const cat of CAFE_77_MENU) {
      for (const item of cat.items) {
        sum += (selections[item.id] ?? 0) * item.price;
      }
    }
    return Math.round(sum * 100) / 100;
  }, [selections]);

  const hasItems = Object.values(selections).some((qty) => qty > 0);

  const buildItemsText = useCallback(() => {
    const lines: string[] = [];
    for (const cat of CAFE_77_MENU) {
      for (const item of cat.items) {
        const qty = selections[item.id] ?? 0;
        if (qty > 0) {
          lines.push(
            `${qty}x ${item.name} ($${(item.price * qty).toFixed(2)})`,
          );
        }
      }
    }
    return lines.join('\n');
  }, [selections]);

  const handleSubmit = useCallback(async () => {
    if (!user || !hasItems) return;

    try {
      const result = await createRequest.mutateAsync({
        post_id: postId,
        seller_id: sellerId,
        items_text: buildItemsText(),
        instructions: instructions.trim() || null,
        est_total: total,
        ordered_proof_path: null,
        order_id_text: null,
        buyer_completed: false,
        seller_completed: false,
        cancel_reason: null,
        cancelled_by: null,
      });
      navigation.replace('OrderDetail', { requestId: result.id });
    } catch (error: any) {
      showAlert('Error', error?.message ?? 'Failed to submit request');
    }
  }, [
    user,
    hasItems,
    postId,
    sellerId,
    buildItemsText,
    instructions,
    total,
    createRequest,
    navigation,
  ]);

  return (
    <WebContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Pick Your Food</Text>
          <Text style={styles.subheading}>
            Choose items up to ${SWIPE_VALUE.toFixed(2)}
          </Text>

          <View style={styles.menuContainer}>
            <MenuPicker
              selections={selections}
              onSelectionsChange={setSelections}
            />
          </View>

          <View style={styles.instructionsContainer}>
            <Input
              label="Special Instructions"
              placeholder="e.g. no pickles, extra sauce"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={
                hasItems
                  ? `Send Request \u2014 $${total.toFixed(2)}`
                  : 'Select items to continue'
              }
              onPress={handleSubmit}
              loading={createRequest.isPending}
              fullWidth
              size="lg"
              disabled={!hasItems}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 24,
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
    marginBottom: 12,
  },
  menuContainer: {
    flex: 1,
  },
  instructionsContainer: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 12,
  },
});
