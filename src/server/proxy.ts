import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const SYSTEM_INSTRUCTION = `You are χρέομαι (Chreomai), an ancient-wisdom-inspired AI Interior Design Consultant. Your name means 'to consult the oracle' in ancient Greek. You combine timeless design principles — proportion, harmony, reason — with modern interior design expertise.

When a user uploads a room photo, always follow this structure:
🔍 ANALYSIS: Describe the current style, colors, and strengths in 2-3 sentences.
✨ TOP 3 IMPROVEMENTS: List 3 specific, actionable improvements with reasoning (prioritized by impact vs. effort).
🛒 PRODUCT PICKS: Suggest 2-3 real products with price range and where to buy (IKEA, West Elm, CB2, Article, Westwing).
🎨 STYLE ALTERNATIVES: Briefly mention 2 alternative style directions that could work.

Keep answers concise and inspiring. Ask about budget and style preferences if not provided. Always respond in the same language the user writes in.`;

// In development: allow localhost:3000. In production: same-origin (no CORS needed),
// but also allow CORS_ORIGIN if set (e.g. custom domain).
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? ['http://localhost:3000', process.env.CORS_ORIGIN]
    : IS_PRODUCTION
      ? true   // same-origin requests in production — allow all
      : 'http://localhost:3000',
  methods: ['POST'],
}));

app.use(express.json({ limit: '25mb' }));

// POST /api/generate-image
app.post('/api/generate-image', async (req, res) => {
  const apiKey = req.headers['x-gemini-key'] as string;
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing x-gemini-key header.' });
  }

  const { base64Image, mimeType, stylePrompt } = req.body;
  if (!base64Image || !stylePrompt) {
    return res.status(400).json({ error: 'base64Image and stylePrompt are required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      config: { responseModalities: ['TEXT', 'IMAGE'] },
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } },
          { text: stylePrompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return res.json({ imageData: part.inlineData.data });
      }
    }
    res.status(500).json({ error: 'No image returned by Gemini.' });
  } catch (error: any) {
    console.error('[/api/generate-image]', error);
    res.status(500).json({ error: error.message || 'Image generation failed.' });
  }
});

// POST /api/generate-image-replicate
app.post('/api/generate-image-replicate', async (req, res) => {
  const apiKey = req.headers['x-replicate-key'] as string;
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing x-replicate-key header.' });
  }

  const { base64Image, mimeType, stylePrompt } = req.body;
  if (!base64Image || !stylePrompt) {
    return res.status(400).json({ error: 'base64Image and stylePrompt are required.' });
  }

  try {
    // Create prediction
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '15a3689ee13b0d2616e98820eca31d4af4a36c58b0040fc64858836',
        input: {
          image: `data:${mimeType || 'image/jpeg'};base64,${base64Image}`,
          prompt: `${stylePrompt}, interior design, photorealistic, high quality`,
          strength: 0.7,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        },
      }),
    });

    const prediction = await createRes.json();
    if (!createRes.ok) {
      throw new Error(prediction.detail || 'Failed to create Replicate prediction.');
    }

    // Poll until succeeded or failed
    const pollUrl = prediction.urls?.get;
    if (!pollUrl) throw new Error('No polling URL returned by Replicate.');

    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(pollUrl, {
        headers: { 'Authorization': `Token ${apiKey}` },
      });
      result = await pollRes.json();
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Replicate prediction failed.');
    }

    // output is an array of image URLs — fetch first and convert to base64
    const imageUrl: string = Array.isArray(result.output) ? result.output[0] : result.output;
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64Out = Buffer.from(imgBuffer).toString('base64');

    return res.json({ imageData: base64Out });
  } catch (error: any) {
    console.error('[/api/generate-image-replicate]', error);
    res.status(500).json({ error: error.message || 'Image generation failed.' });
  }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  const apiKey = req.headers['x-gemini-key'] as string;
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing x-gemini-key header.' });
  }

  const { message, history, roomImage } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history: history || [],
    });

    const contents: any[] = [{ text: message }];
    if (roomImage) {
      const mimeType = roomImage.startsWith('data:')
        ? roomImage.split(';')[0].split(':')[1]
        : 'image/jpeg';
      contents.push({
        inlineData: {
          data: roomImage.split(',')[1] || roomImage,
          mimeType,
        },
      });
    }

    const response = await chat.sendMessage({ message: contents });
    res.json({ response: response.text });
  } catch (error: any) {
    console.error('[/api/chat]', error);
    res.status(500).json({ error: error.message || 'Chat failed.' });
  }
});

// In production: serve the built React frontend and handle SPA routing.
// API routes above take priority over static files.
if (IS_PRODUCTION) {
  const distPath = join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`λόγος ${IS_PRODUCTION ? 'production' : 'proxy'} server running on http://localhost:${PORT}`);
});
