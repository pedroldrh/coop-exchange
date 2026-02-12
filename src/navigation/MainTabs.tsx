import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { useAuth } from '../hooks/use-auth';
import { useOrderNotifications } from '../hooks/use-order-notifications';
import { FeedStack } from './FeedStack';
import { OrdersStack } from './OrdersStack';
import { ProfileStack } from './ProfileStack';
import { AdminScreen } from '../screens/admin/AdminScreen';

/* ------------------------------------------------------------------ */
/* Tab navigator                                                       */
/* ------------------------------------------------------------------ */

const Tab = createBottomTabNavigator<MainTabParamList>();

const PRIMARY = '#4F46E5';
const GRAY400 = '#9CA3AF';

export function MainTabs() {
  const { isAdmin } = useAuth();
  useOrderNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: GRAY400,
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
            <Text style={[styles.tabIcon, { color }]}>&#9776;</Text>
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          tabBarLabel: 'My Requests',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>&#9993;</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>&#9823;</Text>
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
              <Text style={[styles.tabIcon, { color }]}>&#9881;</Text>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingBottom: 4,
    height: 56,
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
