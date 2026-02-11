import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { usePosts, useMyPosts } from '../../hooks/use-posts';
import { PostCard } from '../../components/PostCard';
import { Loading } from '../../components/ui/Loading';
import type { Post, Profile } from '../../types/database';

type PostWithSeller = Post & { seller: Profile };
type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

const colors = {
  primary: '#4F46E5',
  gray50: '#F9FAFB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray900: '#111827',
  white: '#FFFFFF',
};

export function FeedScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const { data: posts, isLoading, refetch, isRefetching } = usePosts();
  const { data: myPosts } = useMyPosts();

  const showCreateButton =
    profile?.role_preference === 'seller' ||
    (myPosts && myPosts.length > 0);

  const handlePostPress = useCallback(
    (postId: string) => {
      navigation.navigate('PostDetail', { postId });
    },
    [navigation],
  );

  const handleCreatePost = useCallback(() => {
    navigation.navigate('CreatePost' as never);
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: PostWithSeller }) => (
      <PostCard post={item} onPress={() => handlePostPress(item.id)} />
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

      {showCreateButton && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          onPress={handleCreatePost}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
});
