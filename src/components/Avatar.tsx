import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { theme } from '../lib/theme';

interface AvatarProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: number;
}

export function Avatar({ name, avatarUrl, size = 48 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const borderRadius = size / 2;

  if (avatarUrl && !failed) {
    return (
      <View style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, borderWidth: 2, borderColor: theme.colors.primarySurface, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius, backgroundColor: theme.colors.primarySurface }}
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

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
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '600',
    color: theme.colors.white,
  },
});
