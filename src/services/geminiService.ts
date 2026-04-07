import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Aura, an expert AI Interior Design Consultant. 
      Your goal is to help users refine their room designs. 
      You are professional, sophisticated, and have a keen eye for aesthetics.
      When a user asks for refinements (e.g., "make the rug blue"), provide specific design advice.
      If they ask for shoppable links, suggest high-quality items from well-known brands (e.g., West Elm, IKEA, Article, CB2) and describe why they fit the design.
      Always maintain a helpful and inspiring tone.`,
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

  const response = await chat.sendMessage({ message: message });
  return response.text;
}
