export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Prediction id zaroori hai' });
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN set nahi hai' });
  }

  try {
    const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: data.detail || 'Status check fail hua' });
    }

    return res.status(200).json({
      status: data.status,
      output: data.output,
      error: data.error,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Kuch galat hua: ' + err.message });
  }
}
