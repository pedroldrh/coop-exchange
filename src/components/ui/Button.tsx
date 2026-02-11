import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

const colors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray800: '#1F2937',
  white: '#FFFFFF',
};

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle; loaderColor: string }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.white },
    loaderColor: colors.white,
  },
  secondary: {
    container: { backgroundColor: colors.gray200 },
    text: { color: colors.gray800 },
    loaderColor: colors.gray800,
  },
  danger: {
    container: { backgroundColor: colors.danger },
    text: { color: colors.white },
    loaderColor: colors.white,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
    loaderColor: colors.primary,
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle; loaderSize: 'small' | 'large' }> = {
  sm: {
    container: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
    text: { fontSize: 13, lineHeight: 18 },
    loaderSize: 'small',
  },
  md: {
    container: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    text: { fontSize: 15, lineHeight: 20 },
    loaderSize: 'small',
  },
  lg: {
    container: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10 },
    text: { fontSize: 17, lineHeight: 22 },
    loaderSize: 'large',
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        vStyle.container,
        sStyle.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size={sStyle.loaderSize}
            color={vStyle.loaderColor}
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={[styles.text, vStyle.text, sStyle.text]}>{title}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
});
