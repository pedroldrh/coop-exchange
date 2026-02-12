import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { useAuth } from './use-auth';

/**
 * Registers the device's Expo push token and saves it to the user's profile.
 * Re-registers on app foreground in case the token rotates.
 */
export function usePushTokenRegistration() {
  const { user } = useAuth();
  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    if (!user || Platform.OS === 'web') return;
    const userId = user.id;

    async function register() {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenData.data;

      // Skip if we already saved this exact token
      if (token === lastToken.current) return;
      lastToken.current = token;

      await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);
    }

    register();

    // Re-register when app comes back to foreground (token can rotate)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') register();
    });

    return () => subscription.remove();
  }, [user]);
}
