import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { type MenuCategory, type MenuItem } from '../lib/menu';
import { theme } from '../lib/theme';

interface MenuPickerProps {
  menu: MenuCategory[];
  maxBudget: number;
  selections: Record<string, number>;
  onSelectionsChange: (selections: Record<string, number>) => void;
}

export function MenuPicker({ menu, maxBudget, selections, onSelectionsChange }: MenuPickerProps) {
  const [activeCategory, setActiveCategory] = useState(menu[0].name);

  const total = useMemo(() => {
    let sum = 0;
    for (const cat of menu) {
      for (const item of cat.items) {
        sum += (selections[item.id] ?? 0) * item.price;
      }
    }
    return Math.round(sum * 100) / 100;
  }, [menu, selections]);

  const selectedCount = useMemo(() => {
    return Object.values(selections).reduce((a, b) => a + b, 0);
  }, [selections]);

  const activeItems = useMemo(
    () => menu.find((c) => c.name === activeCategory)?.items ?? [],
    [menu, activeCategory],
  );

  const canAddItem = useCallback(
    (item: MenuItem) => total + item.price <= maxBudget + 0.001,
    [total, maxBudget],
  );

  const handleIncrement = useCallback(
    (item: MenuItem) => {
      if (!canAddItem(item)) return;
      onSelectionsChange({
        ...selections,
        [item.id]: (selections[item.id] ?? 0) + 1,
      });
    },
    [selections, onSelectionsChange, canAddItem],
  );

  const handleDecrement = useCallback(
    (itemId: string) => {
      const current = selections[itemId] ?? 0;
      if (current <= 0) return;
      const next = { ...selections };
      if (current === 1) {
        delete next[itemId];
      } else {
        next[itemId] = current - 1;
      }
      onSelectionsChange(next);
    },
    [selections, onSelectionsChange],
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => {
      const qty = selections[item.id] ?? 0;
      const disabled = !canAddItem(item) && qty === 0;

      return (
        <View style={[styles.itemRow, disabled && styles.itemRowDisabled]}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, disabled && styles.itemNameDisabled]}>
              {item.name}
            </Text>
            <Text style={[styles.itemPrice, disabled && styles.itemPriceDisabled]}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
          <View style={styles.qtyControls}>
            {qty > 0 && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.qtyButton,
                    pressed && styles.qtyButtonPressed,
                  ]}
                  onPress={() => handleDecrement(item.id)}
                >
                  <Text style={styles.qtyButtonText}>{'\u2212'}</Text>
                </Pressable>
                <Text style={styles.qtyText}>{qty}</Text>
              </>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.qtyButton,
                styles.qtyButtonAdd,
                (disabled || (!canAddItem(item) && qty > 0)) && styles.qtyButtonDisabled,
                pressed && !disabled && styles.qtyButtonPressed,
              ]}
              onPress={() => handleIncrement(item)}
              disabled={!canAddItem(item)}
            >
              <Text
                style={[
                  styles.qtyButtonText,
                  styles.qtyButtonAddText,
                  !canAddItem(item) && styles.qtyButtonTextDisabled,
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>
        </View>
      );
    },
    [selections, canAddItem, handleIncrement, handleDecrement],
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {menu.map((cat) => (
          <Pressable
            key={cat.name}
            style={[
              styles.tab,
              activeCategory === cat.name && styles.tabActive,
            ]}
            onPress={() => setActiveCategory(cat.name)}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === cat.name && styles.tabTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={activeItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomBar}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>
            {selectedCount} item{selectedCount !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.totalAmount}>
            <Text style={total > maxBudget ? styles.totalOver : styles.totalOk}>
              ${total.toFixed(2)}
            </Text>
            <Text style={styles.totalMax}> / ${maxBudget.toFixed(2)}</Text>
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min((total / maxBudget) * 100, 100)}%`,
              },
              total >= maxBudget && styles.progressBarFull,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.gray100,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.gray500,
  },
  tabTextActive: {
    color: theme.colors.white,
  },
  listContent: {
    paddingBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  itemRowDisabled: {
    opacity: 0.4,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  itemNameDisabled: {
    color: theme.colors.gray400,
  },
  itemPrice: {
    fontSize: 13,
    color: theme.colors.gray500,
  },
  itemPriceDisabled: {
    color: theme.colors.gray400,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonAdd: {
    backgroundColor: theme.colors.primarySurface,
  },
  qtyButtonPressed: {
    opacity: 0.7,
  },
  qtyButtonDisabled: {
    backgroundColor: theme.colors.gray100,
    opacity: 0.4,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray700,
    lineHeight: 20,
  },
  qtyButtonAddText: {
    color: theme.colors.primary,
  },
  qtyButtonTextDisabled: {
    color: theme.colors.gray400,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
    minWidth: 20,
    textAlign: 'center',
  },
  bottomBar: {
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  totalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 13,
    color: theme.colors.gray500,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalOk: {
    color: theme.colors.primary,
  },
  totalOver: {
    color: theme.colors.danger,
  },
  totalMax: {
    fontSize: 14,
    color: theme.colors.gray400,
    fontWeight: '400',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gray100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  progressBarFull: {
    backgroundColor: theme.colors.success,
  },
});
