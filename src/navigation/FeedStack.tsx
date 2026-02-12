import React from 'react';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../types/navigation';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { PostDetailScreen } from '../screens/posts/PostDetailScreen';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { CreateRequestScreen } from '../screens/orders/CreateRequestScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#4F46E5',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen as any}
        options={{ title: 'Feed' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen as any}
        options={{ title: 'Swipe Details' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen as any}
        options={{ title: 'Create Post' }}
      />
      <Stack.Screen
        name="CreateRequest"
        component={CreateRequestScreen as any}
        options={{ title: 'Pick Your Food' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen as any}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
}
