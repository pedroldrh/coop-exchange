import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

interface StarDisplayProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export function StarDisplay({
  rating,
  size = 16,
  showValue = false,
}: StarDisplayProps) {
  const stars: string[] = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push('\u2605');
    } else if (rating >= i - 0.5) {
      stars.push('\u2605');
    } else {
      stars.push('\u2606');
    }
  }

  return (
    <View style={styles.container} accessibilityLabel={`${rating.toFixed(1)} out of 5 stars`}>
      {stars.map((star, index) => {
        const isFilled = rating >= index + 0.5;
        return (
          <Text
            key={index}
            style={[
              {
                fontSize: size,
                color: isFilled ? theme.colors.gold : theme.colors.gray300,
                marginRight: 1,
              },
            ]}
          >
            {star}
          </Text>
        );
      })}
      {showValue && (
        <Text style={[styles.value, { fontSize: size - 2 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    marginLeft: 4,
    color: theme.colors.gray700,
    fontWeight: '500',
  },
});
