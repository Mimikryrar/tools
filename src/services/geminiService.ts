import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'mid-century',
    name: 'Mid-Century Modern',
    description: 'Clean lines, organic shapes, and functional wooden furniture.',
    prompt: 'Reimagine this room in a Mid-Century Modern style. Use iconic wooden furniture, tapered legs, organic shapes, and a palette of mustard yellow, teal, and warm wood tones. Keep the basic structure of the room but replace the furniture and decor.'
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Minimalism, functionality, and light, airy spaces.',
    prompt: 'Reimagine this room in a Scandinavian style. Use light wood, white walls, minimalist furniture, and cozy textures like wool and sheepskin. Focus on functionality and a bright, airy feel with neutral tones.'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials like exposed brick, metal, and reclaimed wood.',
    prompt: 'Reimagine this room in an Industrial style. Incorporate exposed brick walls, metal accents, dark leather furniture, and reclaimed wood. Use a palette of gray, black, and rust tones.'
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Eclectic, colorful, and full of plants and patterns.',
    prompt: 'Reimagine this room in a Bohemian style. Use vibrant colors, layered rugs, plenty of indoor plants, macrame wall hangings, and eclectic furniture. The vibe should be relaxed and artistic.'
  },
  {
    id: 'japandi',
    name: 'Japandi',
    description: 'A blend of Japanese minimalism and Scandinavian functionality.',
    prompt: 'Reimagine this room in a Japandi style. Combine Japanese aesthetic of wabi-sabi with Scandinavian functionality. Use natural materials, low-profile furniture, a neutral palette, and a focus on simplicity and tranquility.'
  }
];

export async function generateReimaginedImage(base64Image: string, stylePrompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: stylePrompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image generated');
  } catch (error) {
    console.error('Error generating reimagined image:', error);
    throw error;
  }
}

export async function chatWithDesigner(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  roomImage?: string
) {
  const chat = ai.chats.create({
    model: 'gemini-2.0-flash',
    config: {
      systemInstruction: `You are Aura, an expert AI Interior Design Consultant with deep knowledge of color psychology, spatial design, and current furniture trends.

When a user uploads a room photo, always follow this structure:
🔍 ANALYSIS: Describe the current style, colors, and strengths in 2-3 sentences.
✨ TOP 3 IMPROVEMENTS: List 3 specific, actionable improvements with reasoning (prioritized by impact vs. effort).
🛒 PRODUCT PICKS: Suggest 2-3 real products with price range and where to buy (IKEA, West Elm, CB2, Article, Westwing).
🎨 STYLE ALTERNATIVES: Briefly mention 2 alternative style directions that could work.

Keep answers concise and inspiring. Ask about budget and style preferences if not provided. Always respond in the same language the user writes in.`,
    },
    history: history,
  });

  const contents: any[] = [{ text: message }];
  if (roomImage) {
    contents.push({
      inlineData: {
        data: roomImage.split(',')[1] || roomImage,
        mimeType: 'image/jpeg',
      },
    });
  }

  const response = await chat.sendMessage({ message: contents });
  return response.text;
}
