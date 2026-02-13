/**
 * Generates a 6-digit verification code, stores its hash in the
 * verification_codes table, and emails the code via Resend.
 */
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body ?? {};
  if (!email || !email.endsWith('@mail.wlu.edu')) {
    return res.status(400).json({ error: 'Valid @mail.wlu.edu email required' });
  }

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  // Generate a 6-digit code
  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  try {
    // Delete any existing codes for this email
    await fetch(
      `${SUPABASE_URL}/rest/v1/verification_codes?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      },
    );

    // Store the new code hash
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/verification_codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        email,
        code_hash: codeHash,
        expires_at: expiresAt,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return res.status(500).json({ error: 'Failed to store code', details: err });
    }

    // Send the code via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Foodie <notifications@foodie-co.com>',
        to: [email],
        subject: 'Your Foodie verification code',
        html: `
          <div style="max-width:400px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="text-align:center;padding:24px 0;">
              <img src="https://www.foodie-co.com/logo-192.png" alt="Foodie" width="64" height="64" style="border-radius:50%;" />
            </div>
            <h2 style="text-align:center;margin:0 0 8px;">Your Verification Code</h2>
            <p style="text-align:center;color:#6B7280;">Enter this code to sign in:</p>
            <p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:16px;background:#F3F4F6;border-radius:8px;">${code}</p>
            <p style="color:#6B7280;font-size:13px;text-align:center;">This code expires in 10 minutes.</p>
            <p style="color:#6B7280;font-size:12px;text-align:center;">— Foodie</p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const emailErr = await emailRes.json();
      return res.status(500).json({ error: 'Failed to send email', details: emailErr });
    }

    return res.status(200).json({ sent: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}
