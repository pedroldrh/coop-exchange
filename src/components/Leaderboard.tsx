import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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

export function Leaderboard() {
  const { data: leaders } = useLeaderboard(5);

  if (!leaders || leaders.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Swipers</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {leaders.map((profile, index) => {
          const topBadge = getTopBadge(profile.completed_count);
          const rankColor = RANK_COLORS[index] ?? colors.gray400;

          return (
            <View key={profile.id} style={styles.card}>
              <View style={[styles.rankCircle, { borderColor: rankColor }]}>
                <Text style={styles.initials}>
                  {(profile.name ?? '?')[0].toUpperCase()}
                </Text>
                <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
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
      </ScrollView>
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
  scrollContent: {
    gap: 12,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    paddingTop: 14,
    width: 90,
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
