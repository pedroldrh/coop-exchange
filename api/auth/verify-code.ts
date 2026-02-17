/**
 * Verifies the user's 6-digit code against the stored hash, then uses
 * the Supabase admin API to generate a session for the user.
 */
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, code } = req.body ?? {};
  if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  // Validate code format (must be exactly 6 digits)
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Code must be a 6-digit number' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail.endsWith('@mail.wlu.edu')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  const codeHash = crypto.createHash('sha256').update(code).digest('hex');

  try {
    // Look up the stored code
    const lookupRes = await fetch(
      `${SUPABASE_URL}/rest/v1/verification_codes?email=eq.${encodeURIComponent(trimmedEmail)}&code_hash=eq.${codeHash}&select=id,expires_at`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      },
    );

    if (!lookupRes.ok) {
      return res.status(500).json({ error: 'Failed to look up code' });
    }

    const rows = await lookupRes.json();
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid code' });
    }

    const row = rows[0];
    if (new Date(row.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Code has expired. Please request a new one.' });
    }

    // Delete the used code
    await fetch(
      `${SUPABASE_URL}/rest/v1/verification_codes?id=eq.${row.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      },
    );

    // Use the admin API to generate a magic link and extract the session
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to create the user — if they already exist, that's fine
    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      email_confirm: true,
    });

    if (createErr && !createErr.message?.includes('already been registered')) {
      return res.status(500).json({ error: 'Failed to provision user' });
    }

    // Generate a magic link (gives us a verified token)
    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: trimmedEmail,
      });

    if (linkErr || !linkData) {
      return res.status(500).json({
        error: 'Failed to generate session',
        details: linkErr?.message,
      });
    }

    // Verify the token server-side to get session tokens
    const tokenHash = linkData.properties?.hashed_token;
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
      },
      body: JSON.stringify({
        token_hash: tokenHash,
        type: 'magiclink',
      }),
    });

    if (!verifyRes.ok) {
      const verifyErr = await verifyRes.text();
      return res.status(500).json({ error: 'Session creation failed', details: verifyErr });
    }

    const sessionData = await verifyRes.json();

    return res.status(200).json({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}
