/**
 * Vercel serverless function — receives Supabase Database Webhook
 * on `requests` INSERT/UPDATE and sends email notifications via Resend.
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
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
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
    // Look up recipient's email
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${notification.recipientId}&select=email,name`,
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
    const recipientEmail = profiles[0]?.email;

    if (!recipientEmail) {
      return res.status(200).json({ skipped: true, reason: 'No email found for recipient' });
    }

    const recipientName = profiles[0]?.name ?? 'there';

    // Send via Resend API
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Coop Exchange <notifications@foodie-co.com>',
        to: [recipientEmail],
        subject: notification.title,
        html: `<p>Hi ${recipientName},</p><p>${notification.body}</p><p style="color:#6B7280;font-size:12px;">— Coop Exchange</p>`,
      }),
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      return res.status(500).json({ error: 'Failed to send email', details: emailData });
    }

    return res.status(200).json({ sent: true, id: emailData.id });
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
