import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../types/navigation';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { PostDetailScreen } from '../screens/posts/PostDetailScreen';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { CreateRequestScreen } from '../screens/orders/CreateRequestScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { theme } from '../lib/theme';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen as any}
        options={{
          headerTitle: () => (
            <Image
              source={require('../../assets/logo.png')}
              style={feedStyles.headerLogo}
              resizeMode="contain"
            />
          ),
        }}
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

const feedStyles = StyleSheet.create({
  headerLogo: {
    width: 100,
    height: 36,
  },
});
