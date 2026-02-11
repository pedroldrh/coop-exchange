import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const colors = {
  white: '#FFFFFF',
};

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label: string;
  color: string;
  textColor?: string;
  size?: BadgeSize;
}

const sizeStyles: Record<BadgeSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    fontSize: 11,
  },
  md: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontSize: 13,
  },
};

export function Badge({
  label,
  color,
  textColor = colors.white,
  size = 'md',
}: BadgeProps) {
  const s = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize: s.fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
  },
  text: {
    fontWeight: '600',
  },
});
