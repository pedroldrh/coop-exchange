import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrdersStackParamList } from '../types/navigation';
import { OrdersListScreen } from '../screens/orders/OrdersListScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { theme } from '../lib/theme';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: '600' },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
    </Stack.Navigator>
  );
}
