import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { usePosts, useCreatePost } from '../../hooks/use-posts';
import { PostCard } from '../../components/PostCard';
import { Leaderboard } from '../../components/Leaderboard';
import { Loading } from '../../components/ui/Loading';
import { WebContainer } from '../../components/ui/WebContainer';
import { useAvatarGeneration } from '../../hooks/use-avatar-generation';
import { showAlert } from '../../lib/utils';
import { theme } from '../../lib/theme';
import type { Post, Profile } from '../../types/database';

type PostWithSeller = Post & { seller: Profile };
type Props = NativeStackScreenProps<FeedStackParamList, 'Feed'>;

const SWIPE_OPTIONS = [1, 2, 3, 4, 5];

export function FeedScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const { data: posts, isLoading, refetch, isRefetching } = usePosts();
  useAvatarGeneration();
  const createPost = useCreatePost();
  const [showSwipeModal, setShowSwipeModal] = useState(false);
  const fabExpanded = useRef(false);
  const fabWidth = useRef(new Animated.Value(60)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const handleFabPress = useCallback(() => {
    if (!fabExpanded.current) {
      fabExpanded.current = true;
      Animated.parallel([
        Animated.spring(fabWidth, {
          toValue: 220,
          useNativeDriver: false,
          friction: 7,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          delay: 80,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      setShowSwipeModal(true);
      fabExpanded.current = false;
      Animated.parallel([
        Animated.spring(fabWidth, {
          toValue: 60,
          useNativeDriver: false,
          friction: 7,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [fabWidth, textOpacity]);

  const handlePostPress = useCallback(
    (post: PostWithSeller) => {
      if (user?.id === post.seller_id) {
        navigation.navigate('PostDetail', { postId: post.id });
      } else {
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
          location: 'coop',
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
        <Text style={styles.emptyIcon}>{'\uD83D\uDCE6'}</Text>
        <Text style={styles.emptyTitle}>No swipes available right now</Text>
        <Text style={styles.emptySubtitle}>Pull down to refresh or check back soon!</Text>
      </View>
    );
  }, [isLoading]);

  const keyExtractor = useCallback((item: PostWithSeller) => item.id, []);

  if (isLoading) {
    return <Loading message="Loading posts..." />;
  }

  return (
    <WebContainer>
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
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {user && (
          <Pressable onPress={handleFabPress}>
            <Animated.View style={[styles.fab, { width: fabWidth, maxWidth: theme.layout.maxContentWidth - 48 }]}>
              <Text style={styles.fabIcon}>{'\u2764\uFE0F'}</Text>
              <Animated.Text style={[styles.fabLabel, { opacity: textOpacity }]}>
                Give out swipes!
              </Animated.Text>
            </Animated.View>
          </Pressable>
        )}

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
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
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
    color: theme.colors.gray900,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.gray500,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  fabIcon: {
    fontSize: 24,
  },
  fabLabel: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xxl,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.shadow.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
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
    backgroundColor: theme.colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  swipeButtonPressed: {
    backgroundColor: theme.colors.primary,
  },
  swipeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalHint: {
    fontSize: 13,
    color: theme.colors.gray400,
  },
});
