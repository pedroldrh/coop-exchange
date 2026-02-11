import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from './ui/Input';

const colors = {
  gray400: '#9CA3AF',
  gray500: '#6B7280',
};

interface ItemsInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const MAX_CHARS = 1000;

export function ItemsInput({
  value,
  onChangeText,
  placeholder = 'e.g.\n2x Oat Milk\n1x Bread\n3x Bananas',
}: ItemsInputProps) {
  const charCount = value.length;

  return (
    <View style={styles.container}>
      <Input
        label="Order Items"
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => {
          if (text.length <= MAX_CHARS) {
            onChangeText(text);
          }
        }}
        multiline
        numberOfLines={6}
      />
      <View style={styles.footer}>
        <Text style={styles.hint}>List each item on a new line</Text>
        <Text
          style={[
            styles.charCount,
            charCount > MAX_CHARS * 0.9 && styles.charCountWarning,
          ]}
        >
          {charCount} / {MAX_CHARS}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -8,
  },
  hint: {
    fontSize: 12,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  charCount: {
    fontSize: 12,
    color: colors.gray400,
  },
  charCountWarning: {
    color: colors.gray500,
    fontWeight: '500',
  },
});
