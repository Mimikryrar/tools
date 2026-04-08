import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY || '';
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
  if (!API_KEY) {
    return res.status(401).json({ error: 'GEMINI_API_KEY is not set on the server.' });
  }

  const { base64Image, mimeType, stylePrompt } = req.body;
  if (!base64Image || !stylePrompt) {
    return res.status(400).json({ error: 'base64Image and stylePrompt are required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
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

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  if (!API_KEY) {
    return res.status(401).json({ error: 'GEMINI_API_KEY is not set on the server.' });
  }

  const { message, history, roomImage } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
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
