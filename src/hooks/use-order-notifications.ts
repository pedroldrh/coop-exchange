import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './use-auth';

// Configure how notifications are shown when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermissions() {
  if (Platform.OS === 'web') return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return;

  await Notifications.requestPermissionsAsync();
}

/**
 * Listens via Supabase realtime for new requests on the current user's posts.
 * When one arrives, fires a local push notification telling the freshman to
 * go place the order.
 */
export function useOrderNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const permissionsRequested = useRef(false);

  // Request notification permissions once
  useEffect(() => {
    if (permissionsRequested.current) return;
    permissionsRequested.current = true;
    requestPermissions();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('seller-new-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests',
          filter: `seller_id=eq.${user.id}`,
        },
        async (payload) => {
          const newRequest = payload.new as {
            id: string;
            items_text: string;
            buyer_id: string;
          };

          // Fetch buyer name for the notification
          let buyerName = 'Someone';
          try {
            const { data } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', newRequest.buyer_id)
              .single();
            if (data?.name) buyerName = data.name;
          } catch {}

          // Build a short preview of the items
          const itemsPreview = newRequest.items_text
            .split('\n')
            .slice(0, 3)
            .join(', ');

          // Fire local notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'New food request!',
              body: `${buyerName} wants: ${itemsPreview}`,
              data: { requestId: newRequest.id },
            },
            trigger: null, // show immediately
          });

          // Refresh request queries so the UI updates
          queryClient.invalidateQueries({ queryKey: ['requests'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
