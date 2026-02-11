import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { StarDisplay } from './StarDisplay';
import { formatRelativeTime, truncateText } from '../lib/utils';
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
  const spotsLeft = post.capacity_remaining;
  const capacityColor =
    spotsLeft === 0
      ? colors.danger
      : spotsLeft <= 2
        ? colors.warning
        : colors.success;
  const capacityLabel =
    spotsLeft === 0 ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`;

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Header: seller info + time */}
      <View style={styles.header}>
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName}>
            {post.seller.name ?? 'Anonymous'}
          </Text>
          <StarDisplay rating={post.seller.rating_avg} size={14} />
        </View>
        <Text style={styles.timeAgo}>{formatRelativeTime(post.created_at)}</Text>
      </View>

      {/* Capacity badge + location */}
      <View style={styles.meta}>
        <Badge label={capacityLabel} color={capacityColor} size="sm" />
        <Text style={styles.capacity}>
          {post.capacity_remaining} / {post.capacity_total}
        </Text>
      </View>

      {/* Location */}
      {post.location && (
        <Text style={styles.location} numberOfLines={1}>
          {post.location}
        </Text>
      )}

      {/* Notes */}
      {post.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {truncateText(post.notes, 120)}
        </Text>
      )}
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
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
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
  capacity: {
    fontSize: 13,
    color: colors.gray500,
    fontWeight: '500',
  },
  location: {
    fontSize: 13,
    color: colors.gray500,
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 20,
    marginTop: 4,
  },
});
