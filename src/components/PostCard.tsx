import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { StarDisplay } from './StarDisplay';
import { formatRelativeTime } from '../lib/utils';
import { getTopBadge } from '../lib/badges';
import { Avatar } from './Avatar';
import { theme } from '../lib/theme';
import type { Post, Profile } from '../types/database';

type PostWithSeller = Post & {
  seller: Profile;
};

interface PostCardProps {
  post: PostWithSeller;
  onPress: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  const swipes = post.capacity_remaining;
  const swipeColor =
    swipes === 0
      ? theme.colors.danger
      : swipes <= 2
        ? theme.colors.warning
        : theme.colors.success;
  const topBadge = getTopBadge(post.seller.completed_count);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: swipeColor }]} />
      <View style={styles.cardContent}>
        {/* Header: seller info + time */}
        <View style={styles.header}>
          <Avatar name={post.seller.name} avatarUrl={post.seller.avatar_url} size={36} />
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
            variant="soft"
          />
        </View>

        <Text style={styles.location} numberOfLines={1}>
          Coop &amp; E-Cafe
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
    borderTopLeftRadius: theme.radius.lg,
    borderBottomLeftRadius: theme.radius.lg,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  sellerInfo: {
    flex: 1,
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
    color: theme.colors.gray900,
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
    color: theme.colors.gray400,
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
    color: theme.colors.gray500,
    marginBottom: 4,
  },
});
