import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
  Modal,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { usePosts, useCreatePost } from '../../hooks/use-posts';
import { PostCard } from '../../components/PostCard';
import { Leaderboard } from '../../components/Leaderboard';
import { Loading } from '../../components/ui/Loading';
import { showAlert } from '../../lib/utils';
import type { Post, Profile } from '../../types/database';

type PostWithSeller = Post & { seller: Profile };
type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

const colors = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  gray50: '#F9FAFB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray900: '#111827',
  white: '#FFFFFF',
};

const SWIPE_OPTIONS = [1, 2, 3, 4, 5];

export function FeedScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const { data: posts, isLoading, refetch, isRefetching } = usePosts();
  const createPost = useCreatePost();
  const [showSwipeModal, setShowSwipeModal] = useState(false);

  const handlePostPress = useCallback(
    (post: PostWithSeller) => {
      if (user?.id === post.seller_id) {
        // Own post — see details and incoming requests
        navigation.navigate('PostDetail', { postId: post.id });
      } else {
        // Someone else's post — go straight to menu picker
        navigation.navigate('CreateRequest', {
          postId: post.id,
          sellerId: post.seller_id,
        });
      }
    },
    [navigation, user?.id],
  );

  const handleSwipeSelect = useCallback(
    async (count: number) => {
      setShowSwipeModal(false);
      try {
        await createPost.mutateAsync({
          capacity_total: count,
          capacity_remaining: count,
          location: 'Cafe 77',
          notes: null,
          max_value_hint: null,
        });
      } catch (error: any) {
        showAlert('Error', error?.message ?? 'Failed to create post');
      }
    },
    [createPost],
  );

  const renderItem = useCallback(
    ({ item }: { item: PostWithSeller }) => (
      <PostCard post={item} onPress={() => handlePostPress(item)} />
    ),
    [handlePostPress],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyTitle}>No swipes available right now</Text>
        <Text style={styles.emptySubtitle}>Check back soon!</Text>
      </View>
    );
  }, [isLoading]);

  const keyExtractor = useCallback((item: PostWithSeller) => item.id, []);

  if (isLoading) {
    return <Loading message="Loading posts..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Leaderboard />}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {user && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          onPress={() => setShowSwipeModal(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      {/* Swipe Count Modal */}
      <Modal
        visible={showSwipeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSwipeModal(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowSwipeModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              How many swipes do you want to share?
            </Text>
            <View style={styles.swipeOptions}>
              {SWIPE_OPTIONS.map((num) => (
                <Pressable
                  key={num}
                  style={({ pressed }) => [
                    styles.swipeButton,
                    pressed && styles.swipeButtonPressed,
                  ]}
                  onPress={() => handleSwipeSelect(num)}
                  disabled={createPost.isPending}
                >
                  <Text style={styles.swipeButtonText}>{num}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.modalHint}>Tap a number to post</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray500,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    lineHeight: 30,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 24,
  },
  swipeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  swipeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  swipeButtonPressed: {
    backgroundColor: colors.primary,
  },
  swipeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  modalHint: {
    fontSize: 13,
    color: colors.gray400,
  },
});
