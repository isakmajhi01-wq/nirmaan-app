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
    const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        input: { prompt: fullPrompt },
      }),
    });

    const prediction = await createRes.json();

    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: prediction.detail || 'Replicate API me error aayi' });
    }

    const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;

    if (!imageUrl) {
      return res.status(202).json({ status: prediction.status, id: prediction.id, message: 'Abhi generate ho raha hai, thodi der me poll karo' });
    }

    return res.status(200).json({ imageUrl });
  } catch (err) {
    return res.status(500).json({ error: 'Kuch gala
