import { createClient } from '@supabase/supabase-js';

function nicknameToWords(nickname: string): string {
  return nickname
    .replace(/[0-9]+$/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim() || nickname;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, nickname } = req.body;
  if (!userId || !nickname) return res.status(400).json({ error: 'userId and nickname required' });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing server configuration', missing: {
      openai: !OPENAI_API_KEY,
      supabaseUrl: !SUPABASE_URL,
      supabaseKey: !SUPABASE_SERVICE_KEY,
    }});
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

    // 2. Upload to Supabase Storage using the JS client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Convert Buffer to Uint8Array for compatibility
    const uint8 = new Uint8Array(buffer);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`${userId}.png`, uint8, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Storage upload failed', details: uploadError.message });
    }

    // 3. Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(`${userId}.png`);

    const avatarUrl = urlData.publicUrl;

    // 4. Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({ error: 'Profile update failed', details: updateError.message });
    }

    return res.status(200).json({ avatar_url: avatarUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}
