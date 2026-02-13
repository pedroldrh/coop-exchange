import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type KeyboardTypeOptions,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { theme } from '../../lib/theme';

interface InputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  keyboardType,
  secureTextEntry = false,
  leftIcon,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : isFocused
      ? theme.colors.primary
      : theme.colors.gray300;

  const bgColor = isFocused ? theme.colors.primarySurface : theme.colors.white;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          { borderColor, backgroundColor: bgColor },
          isFocused && styles.inputWrapperFocused,
          multiline && { height: 20 * numberOfLines + 24, alignItems: 'flex-start' as const },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon != null && styles.inputWithIcon,
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray400}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderWidth: 2,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.gray900,
    paddingVertical: 10,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  multilineInput: {
    paddingTop: 12,
  },
  error: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 4,
  },
});
