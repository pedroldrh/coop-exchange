import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Platform,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { theme } from '../../lib/theme';

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

const variantStyles: Record<ButtonVariant, {
  container: ViewStyle;
  pressedContainer: ViewStyle;
  text: TextStyle;
  loaderColor: string;
}> = {
  primary: {
    container: { backgroundColor: theme.colors.primary },
    pressedContainer: { backgroundColor: theme.colors.primaryDark },
    text: { color: theme.colors.white },
    loaderColor: theme.colors.white,
  },
  secondary: {
    container: { backgroundColor: theme.colors.gray200 },
    pressedContainer: { backgroundColor: theme.colors.gray300 },
    text: { color: theme.colors.gray800 },
    loaderColor: theme.colors.gray800,
  },
  danger: {
    container: { backgroundColor: theme.colors.danger },
    pressedContainer: { backgroundColor: '#DC2626' },
    text: { color: theme.colors.white },
    loaderColor: theme.colors.white,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    pressedContainer: { backgroundColor: theme.colors.gray100 },
    text: { color: theme.colors.primary },
    loaderColor: theme.colors.primary,
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle; loaderSize: 'small' | 'large' }> = {
  sm: {
    container: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: theme.radius.sm },
    text: { fontSize: 13, lineHeight: 18 },
    loaderSize: 'small',
  },
  md: {
    container: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: theme.radius.md },
    text: { fontSize: 15, lineHeight: 20 },
    loaderSize: 'small',
  },
  lg: {
    container: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: theme.radius.lg },
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
        pressed && !isDisabled && vStyle.pressedContainer,
        Platform.OS === 'web' && ({ cursor: isDisabled ? 'not-allowed' : 'pointer' } as any),
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
    letterSpacing: 0.3,
  },
});
