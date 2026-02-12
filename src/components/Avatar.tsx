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

/**
 * Split a PascalCase / camelCase nickname into words and strip trailing numbers.
 * "SpicyNugget742" → "Spicy Nugget"
 * "FireDorito"     → "Fire Dorito"
 * "BurritoQueen99" → "Burrito Queen"
 */
function nicknameToWords(nickname: string): string {
  return nickname
    .replace(/[0-9]+$/g, '')           // strip trailing numbers
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase split
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // consecutive caps
    .trim() || nickname;
}

function buildAvatarUrl(name: string, size: number): string {
  const words = nicknameToWords(name);
  const prompt = `${words}, cute cartoon character avatar, food mascot style, vibrant colors, simple background, digital art`;
  const encoded = encodeURIComponent(prompt);
  const seed = encodeURIComponent(name);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${size}&height=${size}&seed=${seed}&nologo=true`;
}

export function Avatar({ name, size = 48 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const borderRadius = size / 2;
  const imgSize = Math.max(size * 2, 256); // request higher res for quality

  if (failed || !name) {
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

  const uri = buildAvatarUrl(name, imgSize);

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
