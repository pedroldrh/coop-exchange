import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './use-auth';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribes the current user to web push notifications.
 * Returns `shouldPrompt` (true if we need to show the custom pre-prompt)
 * and `subscribe` (triggers the native permission + push subscription).
 */
export function useWebPush() {
  const { user } = useAuth();
  const [shouldPrompt, setShouldPrompt] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!user) return;
    if (!VAPID_PUBLIC_KEY) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (!('Notification' in window)) return;

    // If already granted, subscribe silently
    if (Notification.permission === 'granted') {
      subscribeAndSave(user.id);
      return;
    }

    // If denied, don't bother
    if (Notification.permission === 'denied') return;

    // Permission is 'default' — show our custom pre-prompt
    setShouldPrompt(true);
  }, [user]);

  const subscribe = useCallback(async () => {
    if (!user) return;
    setShouldPrompt(false);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      await subscribeAndSave(user.id);
    } catch (err) {
      console.warn('[WebPush] Setup failed:', err);
    }
  }, [user]);

  const dismiss = useCallback(() => {
    setShouldPrompt(false);
  }, []);

  return { shouldPrompt, subscribe, dismiss };
}

async function subscribeAndSave(userId: string) {
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ push_token: JSON.stringify(subscription.toJSON()) })
      .eq('id', userId);

    if (error) {
      console.warn('[WebPush] Failed to save subscription:', error.message);
    } else {
      console.log('[WebPush] Subscription saved');
    }
  } catch (err) {
    console.warn('[WebPush] Subscribe failed:', err);
  }
}
