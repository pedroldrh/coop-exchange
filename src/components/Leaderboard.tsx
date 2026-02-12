import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useLeaderboard } from '../hooks/use-leaderboard';
import { getTopBadge } from '../lib/badges';

const colors = {
  primary: '#4F46E5',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray900: '#111827',
  white: '#FFFFFF',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  bronze: '#CD7F32',
};

const RANK_COLORS = [colors.gold, colors.silver, colors.bronze];
const CARD_WIDTH = 90;
const CARD_GAP = 12;
const SCROLL_SPEED = 30; // pixels per second

export function Leaderboard() {
  const { data: leaders } = useLeaderboard(10);
  const scrollX = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!leaders || leaders.length <= 3) return;

    const totalWidth = leaders.length * (CARD_WIDTH + CARD_GAP);
    const duration = (totalWidth / SCROLL_SPEED) * 1000;

    const startAnimation = () => {
      scrollX.setValue(0);
      animRef.current = Animated.timing(scrollX, {
        toValue: totalWidth,
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
  }, [leaders, scrollX]);

  if (!leaders || leaders.length === 0) return null;

  // Duplicate the list so the scroll loops seamlessly
  const items = leaders.length > 3 ? [...leaders, ...leaders] : leaders;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Swipers</Text>
      <View style={styles.scrollMask}>
        <Animated.View
          style={[
            styles.track,
            leaders.length > 3 && {
              transform: [{ translateX: Animated.multiply(scrollX, -1) }],
            },
          ]}
        >
          {items.map((profile, index) => {
            const rank = index % leaders.length;
            const topBadge = getTopBadge(profile.completed_count);
            const rankColor = RANK_COLORS[rank] ?? colors.gray400;

            return (
              <View key={`${profile.id}-${index}`} style={styles.card}>
                <View style={[styles.rankCircle, { borderColor: rankColor }]}>
                  <Text style={styles.initials}>
                    {(profile.name ?? '?')[0].toUpperCase()}
                  </Text>
                  <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
                    <Text style={styles.rankText}>{rank + 1}</Text>
                  </View>
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {profile.name?.split(' ')[0] ?? 'Anon'}
                </Text>
                <Text style={styles.count}>
                  {profile.completed_count} swipe{profile.completed_count !== 1 ? 's' : ''}
                </Text>
                {topBadge && (
                  <Text style={styles.badgeIcon}>{topBadge.icon}</Text>
                )}
              </View>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 12,
  },
  scrollMask: {
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    paddingTop: 14,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rankCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  initials: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  count: {
    fontSize: 11,
    color: colors.gray500,
  },
  badgeIcon: {
    fontSize: 14,
    marginTop: 4,
  },
});
