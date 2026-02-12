/**
 * Vercel serverless function — receives Supabase Database Webhook
 * on `requests` INSERT/UPDATE and sends Expo push notifications.
 */

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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  const payload: WebhookPayload = req.body;
  if (payload.table !== 'requests') {
    return res.status(200).json({ skipped: true, reason: 'Not a requests event' });
  }

  const record = payload.record;
  const notification = getNotification(payload);
  if (!notification) {
    return res.status(200).json({ skipped: true, reason: 'No notification for this event' });
  }

  try {
    // Look up recipient's push_token
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${notification.recipientId}&select=push_token`,
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
    const pushToken = profiles[0]?.push_token;

    if (!pushToken) {
      return res.status(200).json({ skipped: true, reason: 'No push token registered' });
    }

    // Send via Expo Push API
    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: pushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: { requestId: record.id },
      }),
    });

    const pushData = await pushRes.json();

    // Handle stale tokens — clear DeviceNotRegistered
    if (pushData.data?.status === 'error' && pushData.data?.details?.error === 'DeviceNotRegistered') {
      await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${notification.recipientId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ push_token: null }),
        },
      );
      return res.status(200).json({ cleared: true, reason: 'DeviceNotRegistered' });
    }

    return res.status(200).json({ sent: true, ticket: pushData });
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
      default:
        return null;
    }
  }

  return null;
}
