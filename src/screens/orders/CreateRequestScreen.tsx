import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
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
import { LOCATIONS, type LocationKey } from '../../lib/menu';
import { SWIPE_VALUE } from '../../lib/constants';
import { showAlert } from '../../lib/utils';
import { theme } from '../../lib/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'CreateRequest'>;

export function CreateRequestScreen({ route, navigation }: Props) {
  const { postId, sellerId, swipes } = route.params;
  const { user } = useAuth();
  const createRequest = useCreateRequest();
  const maxBudget = SWIPE_VALUE * swipes;

  const [selectedLocation, setSelectedLocation] = useState<LocationKey | null>(null);
  const menu = selectedLocation ? LOCATIONS[selectedLocation].menu : null;

  const [selections, setSelections] = useState<Record<string, number>>({});
  const [instructions, setInstructions] = useState('');

  const total = useMemo(() => {
    if (!menu) return 0;
    let sum = 0;
    for (const cat of menu) {
      for (const item of cat.items) {
        sum += (selections[item.id] ?? 0) * item.price;
      }
    }
    return Math.round(sum * 100) / 100;
  }, [selections, menu]);

  const hasItems = Object.values(selections).some((qty) => qty > 0);

  const handleLocationChange = useCallback((key: LocationKey) => {
    setSelectedLocation(key);
    setSelections({});
  }, []);

  const buildItemsText = useCallback(() => {
    if (!menu) return '';
    const lines: string[] = [];
    for (const cat of menu) {
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
  }, [selections, menu]);

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
            Where are you ordering from?
          </Text>

          <View style={styles.locationButtons}>
            {(Object.keys(LOCATIONS) as LocationKey[]).map((key) => (
              <Pressable
                key={key}
                style={[
                  styles.locationChip,
                  selectedLocation === key && styles.locationChipActive,
                ]}
                onPress={() => handleLocationChange(key)}
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

          {menu && (
            <>
              <Text style={styles.menuSubheading}>
                Choose items up to ${maxBudget.toFixed(2)} ({swipes} swipe{swipes !== 1 ? 's' : ''})
              </Text>

              <View style={styles.menuContainer}>
                <MenuPicker
                  menu={menu}
                  maxBudget={maxBudget}
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
            </>
          )}
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
  locationButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
  menuSubheading: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginBottom: 8,
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
