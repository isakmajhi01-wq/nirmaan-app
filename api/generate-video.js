export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST use karo' });
  }

  const { prompt, style } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt zaroori hai' });
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN set nahi hai. Vercel project settings me environment variable add karo.' });
  }

  const fullPrompt = style ? `${prompt}, ${style} style` : prompt;

  try {
    const createRes = await fetch('https://api.replicate.com/v1/models/kwaivgi/kling-v1.6-standard/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=60',
      },
      body: JSON.stringify({
        input: { prompt: fullPrompt, duration: 5 },
      }),
    });

    const prediction = await createRes.json();

    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: prediction.detail || 'Replicate API me error aayi' });
    }

    return res.status(200).json({ id: prediction.id, status: prediction.status });
  } catch (err) {
    return res.status(500).json({ error: 'Kuch galat hua: ' + err.message });
  }
}
