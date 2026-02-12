import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { usePost } from '../../hooks/use-posts';
import { useRequestsByPost, useHasShared } from '../../hooks/use-requests';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { StarDisplay } from '../../components/StarDisplay';
import { RequestCard } from '../../components/RequestCard';
import { formatDate } from '../../lib/utils';

type Props = NativeStackScreenProps<FeedStackParamList, 'PostDetail'>;

const colors = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

export function PostDetailScreen({ route, navigation }: Props) {
  const { postId } = route.params;
  const { user } = useAuth();

  const { data: post, isLoading, refetch, isRefetching } = usePost(postId);
  const { data: requests } = useRequestsByPost(postId);
  const { data: hasShared, isLoading: sharingLoading } = useHasShared();

  const isOwner = user?.id === post?.seller_id;
  const isFull = post?.capacity_remaining === 0;
  const canRequest = hasShared === true;

  const handleRequestOrder = useCallback(() => {
    if (!post) return;
    navigation.navigate('CreateRequest', {
      postId: post.id,
      sellerId: post.seller_id,
    });
  }, [navigation, post]);

  const handleRequestPress = useCallback(
    (requestId: string) => {
      navigation.navigate('OrderDetail', { requestId });
    },
    [navigation],
  );

  if (isLoading || !post) {
    return <Loading message="Loading post..." />;
  }

  const spotsLeft = post.capacity_remaining;
  const capacityColor =
    spotsLeft === 0 ? colors.danger : spotsLeft <= 2 ? colors.warning : colors.success;
  const capacityLabel =
    spotsLeft === 0
      ? 'Full'
      : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Freshman Info Card */}
      <Card style={styles.sellerCard}>
        <View style={styles.sellerHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(post.seller.name ?? '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>
              {post.seller.name ?? 'Anonymous'}
            </Text>
            <StarDisplay rating={post.seller.rating_avg} size={16} showValue />
          </View>
        </View>
      </Card>

      {/* Post Details Card */}
      <Card style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Swipe Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Capacity</Text>
          <View style={styles.capacityRow}>
            <Badge label={capacityLabel} color={capacityColor} size="sm" />
            <Text style={styles.capacityText}>
              {post.capacity_remaining} / {post.capacity_total}
            </Text>
          </View>
        </View>

        {post.location && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup Location</Text>
            <Text style={styles.detailValue}>{post.location}</Text>
          </View>
        )}

        {post.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.notesText}>{post.notes}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Posted</Text>
          <Text style={styles.detailValue}>{formatDate(post.created_at)}</Text>
        </View>
      </Card>

      {/* Request Order Button — only for other people's posts */}
      {!isOwner && (
        <View style={styles.actionSection}>
          <Button
            title={
              isFull
                ? 'No Swipes Available'
                : !canRequest
                ? 'Share a swipe first to request food'
                : 'Request Food'
            }
            onPress={handleRequestOrder}
            disabled={isFull || !canRequest || sharingLoading}
            fullWidth
            size="lg"
          />
          {!canRequest && !sharingLoading && (
            <Text style={styles.gateHint}>
              You must successfully share at least 1 meal before you can request food.
            </Text>
          )}
        </View>
      )}

      {/* Existing requests (visible to post owner) */}
      {isOwner && requests && requests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>
            Food Requests ({requests.length})
          </Text>
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              currentUserId={user!.id}
              onPress={() => handleRequestPress(request.id)}
            />
          ))}
        </View>
      )}

      {isOwner && requests && requests.length === 0 && (
        <View style={styles.emptyRequests}>
          <Text style={styles.emptyText}>No requests yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sellerCard: {
    marginBottom: 12,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  sellerDetails: {
    flex: 1,
    gap: 4,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  detailCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray500,
  },
  detailValue: {
    fontSize: 14,
    color: colors.gray900,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capacityText: {
    fontSize: 13,
    color: colors.gray500,
    fontWeight: '500',
  },
  notesSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  notesText: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 22,
    marginTop: 4,
  },
  actionSection: {
    marginBottom: 16,
  },
  gateHint: {
    fontSize: 13,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  requestsSection: {
    marginTop: 8,
  },
  emptyRequests: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray400,
  },
});
