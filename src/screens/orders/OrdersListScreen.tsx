import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
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
type TabKey = 'buyer' | 'seller';

const colors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray900: '#111827',
  white: '#FFFFFF',
};

export function OrdersListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { data: requests, isLoading, refetch, isRefetching } = useMyRequests();
  const [activeTab, setActiveTab] = useState<TabKey>('buyer');

  const buyerRequests = useMemo(
    () => requests?.filter((r) => r.buyer_id === user?.id) ?? [],
    [requests, user?.id],
  );

  const sellerRequests = useMemo(
    () => requests?.filter((r) => r.seller_id === user?.id) ?? [],
    [requests, user?.id],
  );

  const activeRequests = activeTab === 'buyer' ? buyerRequests : sellerRequests;

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
    const message =
      activeTab === 'buyer'
        ? 'No orders as a buyer yet.\nBrowse the feed to request an order!'
        : 'No orders as a seller yet.\nCreate a post to start receiving requests!';
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>
          {activeTab === 'buyer' ? '🛒' : '📋'}
        </Text>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  }, [isLoading, activeTab]);

  const keyExtractor = useCallback(
    (item: RequestWithDetails) => item.id,
    [],
  );

  if (isLoading) {
    return <Loading message="Loading orders..." />;
  }

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'buyer' && styles.tabActive]}
          onPress={() => setActiveTab('buyer')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'buyer' && styles.tabTextActive,
            ]}
          >
            As Buyer ({buyerRequests.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'seller' && styles.tabActive]}
          onPress={() => setActiveTab('seller')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'seller' && styles.tabTextActive,
            ]}
          >
            As Seller ({sellerRequests.length})
          </Text>
        </Pressable>
      </View>

      {/* Request List */}
      <FlatList
        data={activeRequests}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray400,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
  emptyText: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
});
