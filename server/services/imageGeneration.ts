import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

interface ImageGenerationOptions {
  title: string;
  hashtag: string;
  theme: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  type: 'banner' | 'content';
}

export async function generateImageFromDescription(description: string, hashtag: string, type: 'banner' | 'content' = 'banner'): Promise<string> {
  try {
    // Use Gemini to analyze content and generate image description
    const imageDescription = await getImageDescriptionFromGemini(description, hashtag, type);
    
    // Extract theme and colors from description
    const theme = extractThemeFromDescription(imageDescription);
    const colors = extractColorsFromDescription(imageDescription);
    
    // Generate PNG image using Canvas
    const imagePath = await generatePNGImage({
      title: extractTitleFromDescription(imageDescription),
      hashtag,
      theme,
      colors,
      type
    });
    
    return imagePath;
  } catch (error) {
    console.error('Error generating image:', error);
    return generateFallbackImage(hashtag, type);
  }
}

async function getImageDescriptionFromGemini(description: string, hashtag: string, type: 'banner' | 'content'): Promise<string> {
  try {
    const prompt = `Baseado no conteúdo: "${description}" e hashtag "${hashtag}", descreva uma imagem profissional para ${type === 'banner' ? 'banner de notícia' : 'conteúdo do artigo'}.

Inclua:
1. Tema visual principal (política, economia, tecnologia, etc.)
2. Cores dominantes (primária, secundária, accent)
3. Elementos visuais específicos
4. Estilo (moderno, clássico, minimalista)
5. Texto principal para a imagem

Formato: Tema|Cor1,Cor2,Cor3|Título|Elementos|Estilo`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Política|#1e40af,#3b82f6,#ef4444|Notícias|Elementos formais|Moderno';
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Política|#1e40af,#3b82f6,#ef4444|Notícias|Elementos formais|Moderno';
  }
}

function extractThemeFromDescription(description: string): string {
  const parts = description.split('|');
  return parts[0] || 'Notícias';
}

function extractColorsFromDescription(description: string): { primary: string; secondary: string; accent: string; text: string } {
  const parts = description.split('|');
  const colorString = parts[1] || '#1e40af,#3b82f6,#ef4444';
  const colors = colorString.split(',').map(c => c.trim());
  
  return {
    primary: colors[0] || '#1e40af',
    secondary: colors[1] || '#3b82f6', 
    accent: colors[2] || '#ef4444',
    text: '#ffffff'
  };
}

function extractTitleFromDescription(description: string): string {
  const parts = description.split('|');
  return parts[2] || 'TrendNews';
}

async function generatePNGImage(options: ImageGenerationOptions): Promise<string> {
  const { title, hashtag, theme, colors, type } = options;
  
  // Set dimensions based on type
  const width = type === 'banner' ? 800 : 400;
  const height = type === 'banner' ? 400 : 400;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.5, colors.secondary);
  gradient.addColorStop(1, colors.accent);
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add overlay for better text readability
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, width, height);
  
  // Draw border
  ctx.strokeStyle = colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  
  // Set font and text properties
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw theme
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText(theme.toUpperCase(), width / 2, height * 0.35);
  
  // Draw hashtag
  ctx.font = '16px Arial, sans-serif';
  ctx.fillStyle = `${colors.text}CC`; // Semi-transparent
  ctx.fillText(hashtag, width / 2, height * 0.5);
  
  // Draw title/brand
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillStyle = colors.text;
  ctx.fillText(title, width / 2, height * 0.65);
  
  // Add decorative elements
  ctx.fillStyle = `${colors.accent}88`;
  ctx.beginPath();
  ctx.arc(width - 60, 60, 20, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = `${colors.primary}66`;
  ctx.fillRect(40, height - 80, 60, 4);
  ctx.fillRect(40, height - 70, 40, 4);
  
  // Add TrendNews branding
  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = `${colors.text}AA`;
  ctx.textAlign = 'right';
  ctx.fillText('TrendNews', width - 20, height - 20);
  
  // Save image to file
  const fileName = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
  const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
  
  // Create directory if it doesn't exist
  const imageDir = path.dirname(imagePath);
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);
  
  // Return public URL
  return `/images/${fileName}`;
}

function generateFallbackImage(hashtag: string, type: 'banner' | 'content'): string {
  // Generate a simple fallback image URL from Picsum
  const seed = hashtag.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const imageId = Math.abs(seed) % 500 + 100;
  const width = type === 'banner' ? 800 : 400;
  const height = type === 'banner' ? 400 : 400;
  
  return `https://picsum.photos/${width}/${height}?random=${imageId}`;
}