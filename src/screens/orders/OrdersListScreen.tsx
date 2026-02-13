import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrdersStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { useMyRequests } from '../../hooks/use-requests';
import { RequestCard } from '../../components/RequestCard';
import { Loading } from '../../components/ui/Loading';
import { WebContainer } from '../../components/ui/WebContainer';
import { theme } from '../../lib/theme';
import type { Request, Profile, Post } from '../../types/database';

type RequestWithDetails = Request & {
  buyer: Profile;
  seller: Profile;
  post: Post;
};

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

export function OrdersListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data: requests, isLoading, refetch, isRefetching } = useMyRequests();

  const handleRequestPress = useCallback(
    (requestId: string) => {
      navigation.navigate('OrderDetail', { requestId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: RequestWithDetails }) => (
      <RequestCard
        request={item}
        currentUserId={user!.id}
        onPress={() => handleRequestPress(item.id)}
      />
    ),
    [user, handleRequestPress],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{'\uD83D\uDCCB'}</Text>
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>
          Share swipes or request food to see your history here
        </Text>
      </View>
    );
  }, [isLoading]);

  const keyExtractor = useCallback(
    (item: RequestWithDetails) => item.id,
    [],
  );

  if (isLoading) {
    return <Loading message="Loading orders..." />;
  }

  return (
    <WebContainer>
      <View style={styles.container}>
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            Platform.OS === 'web' ? (
              <Pressable
                style={styles.webRefreshRow}
                onPress={() => { if (!isRefetching) refetch(); }}
                disabled={isRefetching}
              >
                {isRefetching ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Text style={styles.webRefreshText}>Tap to refresh</Text>
                )}
              </Pressable>
            ) : undefined
          }
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.white}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  webRefreshRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  webRefreshText: {
    fontSize: 13,
    color: theme.colors.gray400,
    fontWeight: '500',
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
});
