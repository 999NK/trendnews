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
    const prompt = `Gere uma descrição detalhada para criar uma imagem PNG sobre o tema: "${description}" relacionado à hashtag "${hashtag}".

Tipo de imagem: ${type === 'banner' ? 'banner horizontal' : 'imagem quadrada de conteúdo'}
Dimensões: ${width}x${height}

Descreva uma composição visual profissional para blog de notícias brasileiro que inclua:
1. Cenário ou ambiente relacionado ao tema (política, economia, tecnologia, esportes, etc.)
2. Elementos visuais brasileiros quando relevante
3. Cores modernas e profissionais (tons de vermelho, branco, cinza)
4. Estilo jornalístico limpo e atual
5. Composição adequada para ${type === 'banner' ? 'banner de artigo' : 'imagem de conteúdo'}

Retorne APENAS uma descrição visual detalhada em português para criação da imagem, sem código ou tags:`;

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
    const imageDescription = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Use the description to generate a contextual PNG image
    if (imageDescription) {
      // Create unique filename for PNG
      const fileName = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
      const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
      
      // Create directory if it doesn't exist
      const imageDir = path.dirname(imagePath);
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }
      
      // Generate a professional PNG based on the description
      const contextualImage = generatePNGFromDescription(imageDescription.trim(), hashtag, type);
      
      // Save the image
      const { default: sharp } = await import('sharp');
      const svgBuffer = Buffer.from(contextualImage);
      
      await sharp(svgBuffer)
        .png()
        .resize(width, height)
        .toFile(imagePath);
      
      return `/images/${fileName}`;
    }
    
    return null;
  } catch (error) {
    console.error('Gemini image generation error:', error);
    return null;
  }
}



function generatePNGFromDescription(description: string, hashtag: string, type: 'banner' | 'content'): string {
  const width = type === 'banner' ? 800 : 400;
  const height = type === 'banner' ? 400 : 400;
  
  // Extract key themes and colors from description
  const theme = extractThemeFromDescription(description);
  const colors = extractColorsFromDescription(description);
  
  // Create a professional SVG based on the description
  return createProfessionalImageFromDescription(width, height, theme, hashtag, colors, description);
}

function extractThemeFromDescription(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('política') || lowerDesc.includes('governo') || lowerDesc.includes('congresso')) return 'politica';
  if (lowerDesc.includes('economia') || lowerDesc.includes('mercado') || lowerDesc.includes('negócios')) return 'economia';
  if (lowerDesc.includes('tecnologia') || lowerDesc.includes('digital') || lowerDesc.includes('inovação')) return 'tecnologia';
  if (lowerDesc.includes('esporte') || lowerDesc.includes('futebol') || lowerDesc.includes('jogos')) return 'esportes';
  if (lowerDesc.includes('cultura') || lowerDesc.includes('música') || lowerDesc.includes('arte')) return 'cultura';
  
  return 'geral';
}

function extractColorsFromDescription(description: string): {primary: string, secondary: string, accent: string, text: string} {
  const lowerDesc = description.toLowerCase();
  
  // Default TrendNews colors
  let primary = '#dc2626', secondary = '#ffffff', accent = '#ef4444', text = '#1f2937';
  
  if (lowerDesc.includes('político') || lowerDesc.includes('governo')) {
    primary = '#1e40af'; secondary = '#ffffff'; accent = '#3b82f6'; text = '#1f2937';
  } else if (lowerDesc.includes('economia') || lowerDesc.includes('financeiro')) {
    primary = '#059669'; secondary = '#ffffff'; accent = '#10b981'; text = '#1f2937';
  } else if (lowerDesc.includes('tecnologia') || lowerDesc.includes('digital')) {
    primary = '#7c3aed'; secondary = '#ffffff'; accent = '#8b5cf6'; text = '#1f2937';
  }
  
  return { primary, secondary, accent, text };
}

function createProfessionalImageFromDescription(width: number, height: number, theme: string, hashtag: string, colors: any, description?: string): string {
  // Create modern news-style SVG with gradient backgrounds and professional typography
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.2" />
      </linearGradient>
      <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors.secondary};stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.7" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="url(#bgGrad)"/>
    <rect width="100%" height="100%" fill="url(#overlay)"/>
    
    <!-- Border -->
    <rect x="10" y="10" width="${width-20}" height="${height-20}" fill="none" stroke="${colors.primary}" stroke-width="3" rx="10"/>
    
    <!-- TrendNews Logo -->
    <rect x="20" y="20" width="40" height="40" fill="${colors.primary}" rx="8"/>
    <text x="40" y="45" text-anchor="middle" fill="${colors.secondary}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">T</text>
    
    <!-- Theme Icon -->
    ${getThemeIcon(theme, width - 80, 30, colors.primary)}
    
    <!-- Main Title -->
    <text x="50%" y="45%" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="${width > 600 ? '24' : '18'}" font-weight="bold">TrendNews</text>
    
    <!-- Hashtag -->
    <text x="50%" y="65%" text-anchor="middle" fill="${colors.primary}" font-family="Arial, sans-serif" font-size="${width > 600 ? '16' : '14'}" font-weight="500">${hashtag}</text>
    
    <!-- Contextual Text -->
    <text x="50%" y="80%" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="12" opacity="0.7">Notícias em tempo real sobre o Brasil</text>
  </svg>`;
}

function getThemeIcon(theme: string, x: number, y: number, color: string): string {
  switch (theme) {
    case 'politica':
      return `<rect x="${x}" y="${y}" width="30" height="20" fill="none" stroke="${color}" stroke-width="2" rx="3"/>
              <circle cx="${x+15}" cy="${y+10}" r="3" fill="${color}"/>`;
    case 'economia':
      return `<polyline points="${x},${y+15} ${x+10},${y+5} ${x+20},${y+10} ${x+30},${y}" fill="none" stroke="${color}" stroke-width="2"/>`;
    case 'tecnologia':
      return `<rect x="${x+5}" y="${y+5}" width="20" height="15" fill="none" stroke="${color}" stroke-width="2" rx="2"/>
              <circle cx="${x+15}" cy="${y+12}" r="2" fill="${color}"/>`;
    case 'esportes':
      return `<circle cx="${x+15}" cy="${y+10}" r="8" fill="none" stroke="${color}" stroke-width="2"/>
              <path d="M${x+15},${y+2} L${x+15},${y+18} M${x+7},${y+10} L${x+23},${y+10}" stroke="${color}" stroke-width="2"/>`;
    default:
      return `<rect x="${x+10}" y="${y+5}" width="10" height="15" fill="${color}" rx="2"/>`;
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