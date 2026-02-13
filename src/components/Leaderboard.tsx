import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Platform } from 'react-native';
import { useLeaderboard } from '../hooks/use-leaderboard';
import { getTopBadge } from '../lib/badges';
import { theme } from '../lib/theme';

const ITEM_WIDTH = 160;
const SCROLL_SPEED = 40;

export function Leaderboard() {
  const { data: leaders } = useLeaderboard(10);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!leaders || leaders.length === 0) return;

    const contentWidth = leaders.length * ITEM_WIDTH;
    const totalTravel = contentWidth;
    const duration = (totalTravel / SCROLL_SPEED) * 1000;

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );

    translateX.setValue(0);
    animation.start();

    return () => {
      animation.stop();
    };
  }, [leaders, translateX]);

  if (!leaders || leaders.length === 0) return null;

  const items = [...leaders, ...leaders, ...leaders];

  return (
    <View style={styles.container}>
      <View style={styles.tickerBar}>
        <View style={styles.labelBox}>
          <Text style={styles.labelText}>TOP{'\n'}SWIPERS</Text>
        </View>
        <View style={styles.tickerMask}>
          <Animated.View
            style={[
              styles.tickerTrack,
              { transform: [{ translateX }] },
            ]}
          >
            {items.map((profile, index) => {
              const rank = index % leaders.length;
              const topBadge = getTopBadge(profile.completed_count);
              const firstName = profile.name?.split(' ')[0] ?? 'Anon';
              const lastInitial = profile.name?.split(' ')[1]?.[0] ?? '';

              return (
                <View key={`${profile.id}-${index}`} style={styles.tickerEntry}>
                  <Text style={styles.tickerRank}>#{rank + 1}</Text>
                  {topBadge && <Text style={styles.tickerBadge}>{topBadge.icon}</Text>}
                  <Text style={styles.tickerName}>
                    {firstName}{lastInitial ? ` ${lastInitial}.` : ''}
                  </Text>
                  <Text style={styles.tickerCount}>{profile.completed_count}</Text>
                  {index < items.length - 1 && <Text style={styles.tickerDot}>  ·  </Text>}
                </View>
              );
            })}
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const webOverflowFix = Platform.OS === 'web'
  ? { overflowX: 'hidden' as any }
  : {};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    overflow: 'hidden',
    ...webOverflowFix,
  },
  tickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    overflow: 'hidden',
    height: 40,
    ...webOverflowFix,
  },
  labelBox: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.white,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 12,
  },
  tickerMask: {
    flex: 1,
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    ...webOverflowFix,
  },
  tickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  tickerEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tickerRank: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 3,
  },
  tickerBadge: {
    fontSize: 13,
    marginRight: 3,
  },
  tickerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginRight: 4,
  },
  tickerCount: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.gray400,
  },
  tickerDot: {
    fontSize: 14,
    color: theme.colors.gray400,
  },
});
