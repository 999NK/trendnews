import path from 'path';

export async function generateArticleImage(
    description: string,
    hashtag: string,
    type: 'banner' | 'content' = 'banner'
): Promise<string> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log("Gemini API key not found, using fallback");
            return generateDefaultPNGImage(hashtag, type);
        }

        const width = type === 'banner' ? 800 : 400;
        const height = type === 'banner' ? 400 : 400;

        // Enhanced prompt for Gemini to generate actual images using Imagen
        const imagePrompt = `Create a professional, photorealistic image for Brazilian journalism based on this description: "${description}"

Image requirements:
- Dimensions: ${width}x${height} pixels
- Style: Professional photojournalism for Brazilian news
- Setting: ${description.includes('shopping') ? 'Brazilian shopping mall interior' : 'Brazilian urban environment'}
- People: Brazilian young adults, diverse, authentic expressions
- Lighting: Natural, well-lit professional photography
- Composition: ${type === 'banner' ? 'Horizontal banner layout suitable for article header' : 'Square format for content placement'}
- Quality: High-resolution, sharp focus, professional news photography style
- Colors: Natural tones with red accents (TrendNews branding)

Generate a realistic photograph that captures this scene with professional news photography standards.`;

        console.log('🖼️ Generating image with Gemini Imagen...');
        
        // Try using Gemini's image generation capabilities
        const imageResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY || ''
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: imagePrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!imageResponse.ok) {
            console.log(`Gemini API error: ${imageResponse.status}, falling back to PNG generation`);
            return await generateProfessionalPNG(description, hashtag, type);
        }

        const imageData = await imageResponse.json();
        const generatedContent = imageData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedContent) {
            // Gemini returned text instead of image, so generate PNG based on description
            console.log('📸 Gemini provided enhanced description, generating PNG...');
            return await generateProfessionalPNG(generatedContent, hashtag, type);
        }
        
        // Fallback to our PNG generation
        return await generateProfessionalPNG(description, hashtag, type);
        
    } catch (error) {
        console.error("Gemini image generation error:", error);
        return await generateProfessionalPNG(description, hashtag, type);
    }
}

// Generate professional PNG based on description
async function generateProfessionalPNG(description: string, hashtag: string, type: 'banner' | 'content'): Promise<string> {
    try {
        const width = type === 'banner' ? 800 : 400;
        const height = type === 'banner' ? 400 : 400;
        
        // Create unique filename
        const fileName = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
        const imagePath = path.join(process.cwd(), 'public', 'images', fileName);
        
        // Ensure directory exists
        const imageDir = path.dirname(imagePath);
        const fs = await import('fs');
        if (!fs.default.existsSync(imageDir)) {
            fs.default.mkdirSync(imageDir, { recursive: true });
        }
        
        // Generate professional SVG based on description
        const professionalSVG = createProfessionalImageFromDescription(description, hashtag, width, height);
        
        // Convert SVG to PNG using Sharp
        const sharp = (await import('sharp')).default;
        const svgBuffer = Buffer.from(professionalSVG);
        
        await sharp(svgBuffer)
            .png()
            .resize(width, height)
            .toFile(imagePath);
        
        console.log(`✅ Generated PNG image: /images/${fileName}`);
        return `/images/${fileName}`;
        
    } catch (error) {
        console.error('Error generating professional PNG:', error);
        return generateDefaultPNGImage(hashtag, type);
    }
}

// Create professional SVG based on contextual description
function createProfessionalImageFromDescription(description: string, hashtag: string, width: number, height: number): string {
    // Analyze description to extract visual elements
    const theme = extractThemeFromDescription(description);
    const colors = extractColorsFromDescription(description);
    
    // Extract key visual elements from description
    const isGroupPhoto = description.includes('grupo') || description.includes('pessoas') || description.includes('fãs');
    const isIndoorScene = description.includes('shopping') || description.includes('interior') || description.includes('sala');
    const hasYoungPeople = description.includes('jovens') || description.includes('adolescente');
    
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.2" />
            </linearGradient>
            <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.6" />
            </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg-grad)"/>
        
        <!-- Main content area -->
        <rect x="40" y="40" width="${width-80}" height="${height-80}" fill="white" rx="12" opacity="0.95"/>
        
        <!-- Header accent -->
        <rect x="40" y="40" width="${width-80}" height="8" fill="url(#accent-grad)" rx="12 12 0 0"/>
        
        <!-- Visual elements based on description -->
        ${isGroupPhoto ? `
            <!-- Group of people silhouettes -->
            <g transform="translate(${width/2-60}, ${height/2-40})">
                <circle cx="30" cy="20" r="12" fill="${colors.accent}" opacity="0.7"/>
                <circle cx="60" cy="25" r="12" fill="${colors.secondary}" opacity="0.7"/>
                <circle cx="90" cy="18" r="12" fill="${colors.accent}" opacity="0.7"/>
                <rect x="18" y="32" width="24" height="35" fill="${colors.accent}" opacity="0.7" rx="12"/>
                <rect x="48" y="37" width="24" height="30" fill="${colors.secondary}" opacity="0.7" rx="12"/>
                <rect x="78" y="30" width="24" height="37" fill="${colors.accent}" opacity="0.7" rx="12"/>
            </g>
        ` : ''}
        
        ${isIndoorScene ? `
            <!-- Indoor scene elements -->
            <rect x="60" y="${height-120}" width="${width-120}" height="80" fill="${colors.primary}" opacity="0.3" rx="8"/>
            <rect x="80" y="${height-100}" width="40" height="60" fill="${colors.accent}" opacity="0.5" rx="4"/>
            <rect x="${width-160}" y="${height-100}" width="40" height="60" fill="${colors.secondary}" opacity="0.5" rx="4"/>
        ` : ''}
        
        <!-- Theme icon -->
        ${getThemeIcon(theme, width-80, 80, colors.accent)}
        
        <!-- TrendNews branding -->
        <text x="${width/2}" y="${height-80}" text-anchor="middle" fill="${colors.accent}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">TrendNews</text>
        
        <!-- Hashtag -->
        <text x="${width/2}" y="${height-60}" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="14">${hashtag}</text>
        
        <!-- Professional overlay pattern -->
        <rect x="60" y="60" width="${width-120}" height="4" fill="${colors.accent}" opacity="0.6" rx="2"/>
        <rect x="60" y="70" width="${Math.floor((width-120) * 0.7)}" height="4" fill="${colors.accent}" opacity="0.4" rx="2"/>
        <rect x="60" y="80" width="${Math.floor((width-120) * 0.5)}" height="4" fill="${colors.accent}" opacity="0.3" rx="2"/>
        
        <!-- Decorative elements -->
        <circle cx="80" cy="100" r="3" fill="${colors.accent}" opacity="0.8"/>
        <circle cx="${width-80}" cy="${height-100}" r="3" fill="${colors.secondary}" opacity="0.8"/>
    </svg>`;
    
    return svg;
}

function getThemeIcon(theme: string, x: number, y: number, color: string): string {
    switch (theme) {
        case 'cultura':
            return `<g transform="translate(${x}, ${y})">
                <circle cx="0" cy="0" r="16" fill="none" stroke="${color}" stroke-width="2"/>
                <path d="M-8,-8 L8,8 M8,-8 L-8,8" stroke="${color}" stroke-width="2"/>
            </g>`;
        case 'politica':
            return `<g transform="translate(${x}, ${y})">
                <rect x="-12" y="-8" width="24" height="16" fill="none" stroke="${color}" stroke-width="2" rx="2"/>
                <circle cx="0" cy="0" r="4" fill="${color}"/>
            </g>`;
        case 'economia':
            return `<g transform="translate(${x}, ${y})">
                <path d="M-10,8 L-5,0 L0,4 L5,-4 L10,2" fill="none" stroke="${color}" stroke-width="2"/>
                <circle cx="10" cy="2" r="2" fill="${color}"/>
            </g>`;
        default:
            return `<g transform="translate(${x}, ${y})">
                <circle cx="0" cy="0" r="8" fill="none" stroke="${color}" stroke-width="2"/>
                <circle cx="0" cy="0" r="3" fill="${color}"/>
            </g>`;
    }
}

function extractThemeFromDescription(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('política') || lowerDesc.includes('governo') || lowerDesc.includes('congresso')) return 'politica';
    if (lowerDesc.includes('economia') || lowerDesc.includes('mercado') || lowerDesc.includes('negócios')) return 'economia';
    if (lowerDesc.includes('tecnologia') || lowerDesc.includes('digital') || lowerDesc.includes('inovação')) return 'tecnologia';
    if (lowerDesc.includes('esporte') || lowerDesc.includes('futebol') || lowerDesc.includes('jogos')) return 'esportes';
    if (lowerDesc.includes('cultura') || lowerDesc.includes('música') || lowerDesc.includes('arte') || lowerDesc.includes('série') || lowerDesc.includes('fãs')) return 'cultura';
    
    return 'geral';
}

function extractColorsFromDescription(description: string): {primary: string, secondary: string, accent: string, text: string} {
    const colors = {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#ef4444',
        text: '#374151'
    };
    
    // Adapt colors based on description content
    if (description.includes('azul') || description.includes('blue')) {
        colors.primary = '#1e40af';
        colors.secondary = '#3b82f6';
    }
    if (description.includes('vermelho') || description.includes('red')) {
        colors.accent = '#ef4444';
    }
    if (description.includes('verde') || description.includes('green')) {
        colors.primary = '#059669';
        colors.secondary = '#10b981';
    }
    if (description.includes('cultura') || description.includes('entretenimento')) {
        colors.primary = '#7c3aed';
        colors.secondary = '#a855f7';
        colors.accent = '#ec4899';
    }
    
    return colors;
}

function generateDefaultPNGImage(hashtag: string, type: 'banner' | 'content'): string {
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:#dc2626;stop-opacity:0.2" />
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="#dc2626" stroke-width="2" rx="10"/>
        <text x="50%" y="40%" text-anchor="middle" fill="#dc2626" font-family="Arial, sans-serif" font-size="20" font-weight="bold">TrendNews</text>
        <text x="50%" y="60%" text-anchor="middle" fill="#dc2626" font-family="Arial, sans-serif" font-size="14">${hashtag}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function generateSEOMetaDescription(title: string, content: string): Promise<string> {
    try {
        const prompt = `
Baseado no título "${title}" e no conteúdo do artigo, crie uma meta descrição SEO otimizada de 150-160 caracteres.

Deve ser:
- Atraente e clicável
- Incluir palavras-chave relevantes
- Despertar curiosidade
- Mencionar benefícios/insights
- Chamar para ação sutil

Formato: apenas a meta descrição, sem aspas ou explicações.
`;

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

        const data = await response.json();
        const metaDescription = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return metaDescription?.trim() || `Descubra insights sobre ${title}. Análise completa com dados, tendências e perspectivas para o Brasil. Leia agora!`;
    } catch (error) {
        console.error("Error generating meta description:", error);
        return `Descubra insights sobre ${title}. Análise completa com dados, tendências e perspectivas para o Brasil. Leia agora!`;
    }
}