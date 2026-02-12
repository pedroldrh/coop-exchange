import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: number;
}

const colors = {
  primary: '#4F46E5',
  white: '#FFFFFF',
};

export function Avatar({ name, avatarUrl, size = 48 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const borderRadius = size / 2;

  // Show stored avatar if available
  if (avatarUrl && !failed) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius, backgroundColor: '#EEF2FF' }}
        onError={() => setFailed(true)}
      />
    );
  }

  // Fallback to initials
  const initials = (name ?? '?')
    .split(/(?=[A-Z])/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius }]}>
      <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '600',
    color: colors.white,
  },
});
