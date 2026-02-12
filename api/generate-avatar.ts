import type { VercelRequest, VercelResponse } from '@vercel/node';

function nicknameToWords(nickname: string): string {
  return nickname
    .replace(/[0-9]+$/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim() || nickname;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, nickname } = req.body;
  if (!userId || !nickname) {
    return res.status(400).json({ error: 'userId and nickname required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  try {
    // 1. Generate image with DALL-E 3
    const words = nicknameToWords(nickname);
    const prompt = `A fun cartoon mascot avatar of "${words}". The character should visually represent the name — for example if the name includes a food item, show that food as a character. Cute, vibrant colors, solid simple background, digital art, profile picture style.`;

    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json();
      return res.status(500).json({ error: 'Image generation failed', details: err });
    }

    const openaiData = await openaiRes.json();
    const b64 = openaiData.data[0].b64_json;
    const buffer = Buffer.from(b64, 'base64');

    // 2. Upload to Supabase Storage (avatars bucket)
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/avatars/${userId}.png`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'image/png',
          'x-upsert': 'true',
        },
        body: buffer,
      },
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return res.status(500).json({ error: 'Storage upload failed', details: err });
    }

    // 3. Build public URL and update profile
    const avatarUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${userId}.png`;

    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ avatar_url: avatarUrl }),
      },
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return res.status(500).json({ error: 'Profile update failed', details: err });
    }

    return res.status(200).json({ avatar_url: avatarUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}
