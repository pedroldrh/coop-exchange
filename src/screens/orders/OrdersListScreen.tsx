import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrdersStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { useMyRequests } from '../../hooks/use-requests';
import { RequestCard } from '../../components/RequestCard';
import { Loading } from '../../components/ui/Loading';
import type { Request, Profile, Post } from '../../types/database';

type RequestWithDetails = Request & {
  buyer: Profile;
  seller: Profile;
  post: Post;
};

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersList'>;

const colors = {
  primary: '#4F46E5',
  gray50: '#F9FAFB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray900: '#111827',
};

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
        <Text style={styles.emptyIcon}>📋</Text>
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
    <View style={styles.container}>
      <FlatList
        data={requests}
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
    textAlign: 'center',
  },
});
