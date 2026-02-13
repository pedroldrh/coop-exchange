import React from 'react';
import { View, Platform, type ViewStyle, type StyleProp } from 'react-native';
import { theme } from '../../lib/theme';

interface WebContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function WebContainer({ children, style }: WebContainerProps) {
  return (
    <View
      style={[
        { flex: 1 },
        Platform.OS === 'web' && {
          maxWidth: theme.layout.maxContentWidth,
          width: '100%' as any,
          alignSelf: 'center' as const,
          overflow: 'hidden' as const,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
