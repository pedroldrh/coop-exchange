function nicknameToWords(nickname: string): string {
  return nickname
    .replace(/[0-9]+$/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim() || nickname;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Admin-only: require a secret header
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — admin access required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  // offset param lets us iterate through ALL users (even those with avatars)
  const offset = parseInt(req.body?.offset ?? '0', 10);

  try {
    // 1. Find ONE profile at the given offset
    const profilesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?name=not.is.null&select=id,name&order=id&limit=1&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      },
    );

    const profiles = await profilesRes.json();

    if (!profiles.length) {
      return res.status(200).json({ message: 'All done! No more users.', done: true });
    }

    // Get total count
    const totalRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?name=not.is.null&select=id`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
        },
      },
    );
    const total = (await totalRes.json()).length;

    const { id: userId, name: nickname } = profiles[0];
    const words = nicknameToWords(nickname);

    // 2. Generate image with DALL-E 3
    const prompt = `Create a premium 3D-rendered character portrait inspired by the nickname "${words}". The character is a stylish, expressive human with exaggerated features like a Pixar or Fortnite skin. They should creatively embody the name — for example "FireDorito" would be a cool character with flame-styled hair holding a glowing Dorito chip, "IceCreamQueen" would be a regal character with an ice cream cone crown. Bold dynamic lighting, rich saturated colors, smooth gradient background, cinematic quality. Absolutely NO text, letters, or words anywhere. Square crop, centered face, profile picture composition.`;

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
      return res.status(500).json({ error: 'Image generation failed', nickname, details: err });
    }

    const openaiData = await openaiRes.json();
    const b64 = openaiData.data[0].b64_json;
    const buffer = Buffer.from(b64, 'base64');

    // 3. Upload to Supabase Storage
    const filePath = `${userId}.png`;
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${filePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'image/png',
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const uploadErr = await uploadRes.text();
      return res.status(500).json({ error: 'Storage upload failed', nickname, details: uploadErr });
    }

    // 4. Update profile
    const avatarUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ avatar_url: avatarUrl }),
    });

    const remaining = total - offset - 1;

    return res.status(200).json({
      message: `Generated avatar for "${nickname}"`,
      nextOffset: offset + 1,
      remaining,
      avatar_url: avatarUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Unknown error' });
  }
}
