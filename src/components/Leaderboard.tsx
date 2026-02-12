import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useLeaderboard } from '../hooks/use-leaderboard';
import { getTopBadge } from '../lib/badges';

const colors = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray800: '#1F2937',
  gray900: '#111827',
  white: '#FFFFFF',
};

const SCROLL_SPEED = 40; // pixels per second
const SEPARATOR = '    ·    ';

export function Leaderboard() {
  const { data: leaders } = useLeaderboard(10);
  const scrollX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!contentWidth || !containerWidth || contentWidth <= containerWidth) return;

    // Start from right edge, scroll all the way left until content is off screen
    const totalDistance = contentWidth + containerWidth;
    const duration = (totalDistance / SCROLL_SPEED) * 1000;

    const startAnimation = () => {
      scrollX.setValue(containerWidth);
      animRef.current = Animated.timing(scrollX, {
        toValue: -contentWidth,
        duration,
        useNativeDriver: true,
        isInteraction: false,
      });
      animRef.current.start(({ finished }) => {
        if (finished) startAnimation();
      });
    };

    startAnimation();

    return () => {
      animRef.current?.stop();
    };
  }, [contentWidth, containerWidth, scrollX]);

  if (!leaders || leaders.length === 0) return null;

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handleContentLayout = (e: LayoutChangeEvent) => {
    setContentWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tickerBar} onLayout={handleContainerLayout}>
        <View style={styles.labelBox}>
          <Text style={styles.labelText}>TOP SWIPERS</Text>
        </View>
        <View style={styles.tickerMask}>
          <Animated.View
            style={[
              styles.tickerTrack,
              { transform: [{ translateX: scrollX }] },
            ]}
            onLayout={handleContentLayout}
          >
            {leaders.map((profile, index) => {
              const topBadge = getTopBadge(profile.completed_count);
              const firstName = profile.name?.split(' ')[0] ?? 'Anon';
              const lastInitial = profile.name?.split(' ')[1]?.[0] ?? '';

              return (
                <Text key={profile.id} style={styles.tickerItem}>
                  {index > 0 ? SEPARATOR : ''}
                  <Text style={styles.tickerRank}>#{index + 1} </Text>
                  {topBadge && (
                    <Text>{topBadge.icon} </Text>
                  )}
                  <Text style={styles.tickerName}>
                    {firstName}{lastInitial ? ` ${lastInitial}.` : ''}
                  </Text>
                  <Text style={styles.tickerCount}>
                    {' '}{profile.completed_count}
                  </Text>
                </Text>
              );
            })}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  tickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray200,
    overflow: 'hidden',
    height: 38,
  },
  labelBox: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  tickerMask: {
    flex: 1,
    overflow: 'hidden',
    height: '100%',
    justifyContent: 'center',
  },
  tickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tickerItem: {
    fontSize: 14,
    color: colors.gray800,
  },
  tickerRank: {
    fontWeight: '700',
    color: colors.primary,
  },
  tickerName: {
    fontWeight: '600',
    color: colors.gray900,
  },
  tickerCount: {
    fontWeight: '500',
    color: colors.gray400,
    fontSize: 13,
  },
});
