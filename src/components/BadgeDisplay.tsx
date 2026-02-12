import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getEarnedBadges, getNextBadge, type BadgeTier } from '../lib/badges';

const colors = {
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
};

interface BadgeDisplayProps {
  completedCount: number;
  showProgress?: boolean;
}

export function BadgeDisplay({ completedCount, showProgress = true }: BadgeDisplayProps) {
  const earned = getEarnedBadges(completedCount);
  const next = getNextBadge(completedCount);

  return (
    <View style={styles.container}>
      {earned.length > 0 ? (
        <View style={styles.badgeRow}>
          {earned.map((badge) => (
            <View
              key={badge.id}
              style={[styles.badgePill, { backgroundColor: badge.color + '18' }]}
            >
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={[styles.badgeLabel, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noBadges}>No badges yet — share your first swipe!</Text>
      )}

      {showProgress && next && (
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            {next.icon} {completedCount}/{next.threshold} to{' '}
            <Text style={{ color: next.color, fontWeight: '600' }}>
              {next.label}
            </Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min((completedCount / next.threshold) * 100, 100)}%`,
                  backgroundColor: next.color,
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  noBadges: {
    fontSize: 13,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  progressSection: {
    gap: 6,
  },
  progressText: {
    fontSize: 12,
    color: colors.gray500,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
