import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const colors = {
  primary: '#4F46E5',
  gray500: '#6B7280',
  white: '#FFFFFF',
};

interface LoadingProps {
  message?: string;
}

export function Loading({ message }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    color: colors.gray500,
    textAlign: 'center',
  },
});
