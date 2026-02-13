import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading, profileComplete } = useAuth();
  const [installPromptSeen, setInstallPromptSeen] = useState<boolean | null>(null);

  // Check if install prompt has been seen (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      setInstallPromptSeen(true); // Skip on native
      return;
    }
    AsyncStorage.getItem('install_prompt_seen').then((val) => {
      setInstallPromptSeen(val === 'true');
    });
  }, []);

  // Also check if already running as PWA (standalone mode) — skip prompt
  const isStandalone =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);

  const showInstallPrompt =
    Platform.OS === 'web' &&
    !isStandalone &&
    user &&
    installPromptSeen === false;

  if (loading || installPromptSeen === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (showInstallPrompt) {
    return (
      <InstallPromptScreen
        onDismiss={() => setInstallPromptSeen(true)}
      />
    );
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
