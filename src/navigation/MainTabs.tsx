import React from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { useAuth } from '../hooks/use-auth';
import { useOrderNotifications } from '../hooks/use-order-notifications';
import { useWebPush } from '../hooks/use-web-push';
import { FeedStack } from './FeedStack';
import { OrdersStack } from './OrdersStack';
import { ProfileStack } from './ProfileStack';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { theme } from '../lib/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { isAdmin } = useAuth();
  useOrderNotifications();
  useWebPush();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedStack}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{'\uD83C\uDF54'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{'\uD83D\uDCCB'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>{'\uD83D\uDC64'}</Text>
          ),
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color }) => (
              <Text style={[styles.tabIcon, { color }]}>{'\u2699'}</Text>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.white,
    borderTopWidth: 0,
    paddingBottom: 4,
    height: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
});
