import { useEffect } from 'react';
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
 * Stores the PushSubscription JSON in the `push_token` column of their profile.
 * No-op on native platforms or if VAPID key is not configured.
 */
export function useWebPush() {
  const { user } = useAuth();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!user) return;
    if (!VAPID_PUBLIC_KEY) {
      console.warn('[WebPush] VAPID public key not configured');
      return;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    let cancelled = false;

    (async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || cancelled) return;

        const registration = await navigator.serviceWorker.ready;

        // Check for existing subscription first
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }

        // Store in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: JSON.stringify(subscription.toJSON()) })
          .eq('id', user.id);

        if (error) {
          console.warn('[WebPush] Failed to save subscription:', error.message);
        } else {
          console.log('[WebPush] Subscription saved');
        }
      } catch (err) {
        console.warn('[WebPush] Setup failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);
}
