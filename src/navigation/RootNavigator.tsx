import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/use-auth';
import { useWebPush } from '../hooks/use-web-push';
import { NotificationPrompt } from '../components/NotificationPrompt';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { InstallPromptScreen } from '../screens/auth/InstallPromptScreen';
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
  const { user, loading } = useAuth();
  const { shouldPrompt, subscribe, dismiss } = useWebPush();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // On web browser (not PWA), always show install prompt — no login needed
  if (Platform.OS === 'web' && !isStandalone) {
    return <InstallPromptScreen onDismiss={() => {}} />;
  }

  return (
    <>
      <NotificationPrompt
        visible={shouldPrompt}
        onEnable={subscribe}
        onDismiss={dismiss}
      />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </>
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
