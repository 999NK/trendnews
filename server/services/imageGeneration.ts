import fs from 'fs';
import path from 'path';

export async function generateImageFromDescription(description: string, hashtag: string, type: 'banner' | 'content' = 'banner'): Promise<string> {
  try {
    // Use Gemini to generate contextual image description and create PNG
    const imageUrl = await generateImageWithGemini(description, hashtag, type);
    
    if (imageUrl) {
      return imageUrl;
    }
    
    return generateFallbackImage(hashtag, type);
  } catch (error) {
    console.error('Error generating image:', error);
    return generateFallbackImage(hashtag, type);
  }
}

async function generateImageWithGemini(description: string, hashtag: string, type: 'banner' | 'content'): Promise<string | null> {
  try {
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    
    // Create contextual SVG using Gemini
    const prompt = `Crie um código SVG profissional para uma imagem de notícia baseada neste contexto:

Conteúdo: "${description}"
Hashtag: "${hashtag}"
Dimensões: ${width}x${height}

Gere um SVG completo e válido que inclua:
1. Gradiente de fundo baseado no tema do conteúdo
2. Elementos visuais relacionados ao tema (política, economia, tecnologia, etc.)
3. Tipografia moderna com o título principal
4. Cores profissionais para blog de notícias brasileiro
5. Logo "TrendNews" discreto no canto
6. Design limpo e jornalístico

Retorne APENAS o código SVG completo, sem explicações:`;

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
    const svgContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Clean up the response to extract just the SVG
    if (svgContent) {
      // Remove code blocks and extract SVG
      const cleanContent = svgContent.replace(/```xml\n|```/g, '').trim();
      const svgMatch = cleanContent.match(/<svg[\s\S]*<\/svg>/i);
      
      if (svgMatch) {
        // Save SVG and convert to PNG data URL
        const svgData = svgMatch[0];
        const base64Svg = Buffer.from(svgData).toString('base64');
        
        // Create unique filename for PNG
        const fileName = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
        const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
        
        // Create directory if it doesn't exist
        const imageDir = path.dirname(imagePath);
        if (!fs.existsSync(imageDir)) {
          fs.mkdirSync(imageDir, { recursive: true });
        }
        
        // Generate PNG using Sharp from SVG
        const { default: sharp } = await import('sharp');
        
        // Clean SVG content to prevent XML parsing errors
        const cleanedSvg = svgData
          .replace(/&(?!#?\w+;)/g, '&amp;') // Escape unescaped & characters
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
        
        await sharp(Buffer.from(cleanedSvg))
          .png()
          .resize(width, height)
          .toFile(imagePath);
        
        return `/images/${fileName}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Gemini image generation error:', error);
    return null;
  }
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