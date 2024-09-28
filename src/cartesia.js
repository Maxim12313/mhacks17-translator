export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { transcript, model_id, voice, output_format } = req.body;

    try {
      const response = await fetch('https://api.cartesia.ai/tts/bytes', {
        method: 'POST',
        headers: {
          'Cartesia-Version': '2024-06-10',
          'X-API-Key': 'cb6e5cbc-95cf-462c-ba19-8a730959284e',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          model_id,
          voice,
          output_format,
        }),
      });

      const data = await response.arrayBuffer();
      res.status(200).send(Buffer.from(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data from Cartesia API' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
