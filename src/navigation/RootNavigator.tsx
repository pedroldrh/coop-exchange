import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/use-auth';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { InstallPromptScreen } from '../screens/auth/InstallPromptScreen';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';
import { MainTabs } from './MainTabs';
import { theme } from '../lib/theme';

import { AuthStackParamList } from '../types/navigation';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Check if running as installed PWA (standalone mode)
const isStandalone =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true);

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading, profileComplete } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // On web browser (not PWA), always show install prompt after login
  if (Platform.OS === 'web' && !isStandalone && user) {
    return <InstallPromptScreen onDismiss={() => {}} />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : !profileComplete ? (
        <RootStack.Screen
          name="ProfileSetup"
          component={ProfileSetupScreen}
        />
      ) : (
        <RootStack.Screen name="Main" component={MainTabs} />
      )}
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
  },
});
