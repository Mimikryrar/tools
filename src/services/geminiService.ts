// In production (Docker/Cloud Run): VITE_API_URL='' → same-origin /api/... requests.
// In local dev: VITE_API_URL is undefined → falls back to http://localhost:3001.
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

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

export async function generateReimaginedImage(base64Image: string, stylePrompt: string, mimeType = 'image/jpeg'): Promise<string> {
  const res = await fetch(`${API_BASE}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64Image: base64Image.split(',')[1] || base64Image,
      mimeType,
      stylePrompt,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Server error ${res.status}`);
  }

  const { imageData } = await res.json();
  return `data:image/png;base64,${imageData}`;
}

export async function chatWithDesigner(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  roomImage?: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, roomImage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || `Server error ${res.status}`);
  }

  const { response } = await res.json();
  return response;
}
