import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../lib/theme';

type BadgeSize = 'sm' | 'md';
type BadgeVariant = 'filled' | 'soft';

interface BadgeProps {
  label: string;
  color: string;
  textColor?: string;
  size?: BadgeSize;
  variant?: BadgeVariant;
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
  textColor,
  size = 'md',
  variant = 'filled',
}: BadgeProps) {
  const s = sizeStyles[size];
  const isSoft = variant === 'soft';

  const bgColor = isSoft ? color + '18' : color;
  const txtColor = textColor ?? (isSoft ? color : theme.colors.white);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
        },
      ]}
    >
      <Text style={[styles.text, { color: txtColor, fontSize: s.fontSize }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
  },
  text: {
    fontWeight: '600',
  },
});
