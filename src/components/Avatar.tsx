import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  name: string | null;
  size?: number;
}

const colors = {
  primary: '#4F46E5',
  white: '#FFFFFF',
};

export function Avatar({ name, size = 48 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const seed = encodeURIComponent(name ?? 'anon');
  const uri = `https://api.dicebear.com/9.x/adventurer/png?seed=${seed}&size=${size * 2}`;

  const borderRadius = size / 2;

  if (failed || !name) {
    const initials = (name ?? '?')
      .split(' ')
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

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius, backgroundColor: '#EEF2FF' }}
      onError={() => setFailed(true)}
    />
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
