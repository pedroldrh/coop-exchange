/**
 * Vercel serverless function — receives Supabase Database Webhook
 * on `requests` INSERT/UPDATE and sends notifications via email (Resend)
 * and web push (VAPID).
 */

import webpush from 'web-push';

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, any>;
  old_record: Record<string, any> | null;
}

interface NotificationInfo {
  recipientId: string;
  title: string;
  body: string;
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-secret');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate webhook secret
  const secret = req.headers['x-webhook-secret'];
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  // Configure web push if VAPID keys are available
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:notifications@foodie-co.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY,
    );
  }

  const payload: WebhookPayload = req.body;
  if (payload.table !== 'requests') {
    return res.status(200).json({ skipped: true, reason: 'Not a requests event' });
  }

  const notification = getNotification(payload);
  if (!notification) {
    return res.status(200).json({ skipped: true, reason: 'No notification for this event' });
  }

  try {
    // Look up recipient's email and push token
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${notification.recipientId}&select=email,name,push_token`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      },
    );

    if (!profileRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    const profiles = await profileRes.json();
    if (!profiles[0]) {
      return res.status(200).json({ skipped: true, reason: 'No profile found for recipient' });
    }

    // Send web push notification if the recipient has a push subscription
    let pushSent = false;
    const pushToken = profiles[0]?.push_token;
    if (pushToken && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      try {
        const subscription = JSON.parse(pushToken);
        // Verify it looks like a web push subscription (has endpoint)
        if (subscription.endpoint) {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: notification.title,
              body: notification.body,
              url: 'https://foodie-co.com',
            }),
          );
          pushSent = true;
        }
      } catch (pushErr: any) {
        console.warn('[send-push] Web push failed:', pushErr.message);
      }
    }

    return res.status(200).json({ sent: true, pushSent });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}

function getNotification(payload: WebhookPayload): NotificationInfo | null {
  const record = payload.record;
  const status: string = record.status;

  if (payload.type === 'INSERT' && status === 'requested') {
    return {
      recipientId: record.seller_id,
      title: 'New swipe request!',
      body: 'Someone wants you to place an order for them.',
    };
  }

  if (payload.type === 'UPDATE') {
    switch (status) {
      case 'accepted':
        return {
          recipientId: record.buyer_id,
          title: 'Your request was accepted!',
          body: 'The sharer accepted your food request.',
        };
      case 'ordered':
        return {
          recipientId: record.buyer_id,
          title: 'Your order has been placed!',
          body: 'The sharer placed your Coop order.',
        };
      case 'picked_up':
        return {
          recipientId: record.buyer_id,
          title: 'Your order is ready for pickup!',
          body: 'Head over to pick up your food.',
        };
      case 'cancelled':
        return {
          recipientId: record.seller_id,
          title: 'Request cancelled',
          body: 'A buyer cancelled their swipe request.',
        };
      default:
        return null;
    }
  }

  return null;
}
