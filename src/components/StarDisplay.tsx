import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colors = {
  gold: '#F59E0B',
  gray300: '#D1D5DB',
  gray700: '#374151',
};

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
      stars.push('\u2605'); // filled star
    } else if (rating >= i - 0.5) {
      stars.push('\u2605'); // half-star rendered as filled (Unicode has no half-star glyph)
    } else {
      stars.push('\u2606'); // empty star
    }
  }

  return (
    <View style={styles.container}>
      {stars.map((star, index) => {
        const isFilled = rating >= index + 0.5;
        return (
          <Text
            key={index}
            style={[
              {
                fontSize: size,
                color: isFilled ? colors.gold : colors.gray300,
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
    color: colors.gray700,
    fontWeight: '500',
  },
});
