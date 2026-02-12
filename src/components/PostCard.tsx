import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { StarDisplay } from './StarDisplay';
import { formatRelativeTime } from '../lib/utils';
import { getTopBadge } from '../lib/badges';
import type { Post, Profile } from '../types/database';

type PostWithSeller = Post & {
  seller: Profile;
};

interface PostCardProps {
  post: PostWithSeller;
  onPress: () => void;
}

const colors = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
};

export function PostCard({ post, onPress }: PostCardProps) {
  const swipes = post.capacity_remaining;
  const swipeColor =
    swipes === 0
      ? colors.danger
      : swipes <= 2
        ? colors.warning
        : colors.success;
  const topBadge = getTopBadge(post.seller.completed_count);

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Header: seller info + time */}
      <View style={styles.header}>
        <View style={styles.sellerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.sellerName}>
              {post.seller.name ?? 'Anonymous'}
            </Text>
            {topBadge && (
              <View style={[styles.topBadge, { backgroundColor: topBadge.color + '18' }]}>
                <Text style={styles.topBadgeIcon}>{topBadge.icon}</Text>
                <Text style={[styles.topBadgeLabel, { color: topBadge.color }]}>
                  {topBadge.label}
                </Text>
              </View>
            )}
          </View>
          <StarDisplay rating={post.seller.rating_avg} size={14} />
        </View>
        <Text style={styles.timeAgo}>{formatRelativeTime(post.created_at)}</Text>
      </View>

      {/* Swipe count + location */}
      <View style={styles.meta}>
        <Badge
          label={swipes === 0 ? 'No swipes left' : `${swipes} swipe${swipes === 1 ? '' : 's'} available`}
          color={swipeColor}
          size="sm"
        />
      </View>

      <Text style={styles.location} numberOfLines={1}>
        Cafe 77
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sellerInfo: {
    flexShrink: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 2,
  },
  topBadgeIcon: {
    fontSize: 10,
  },
  topBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 12,
    color: colors.gray400,
    marginLeft: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: colors.gray500,
    marginBottom: 4,
  },
});
