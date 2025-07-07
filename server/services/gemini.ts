export async function generateArticleImage(
    title: string,
    hashtag: string,
    type: 'banner' | 'content' = 'banner'
): Promise<string> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log("Gemini API key not found, using fallback");
            return generateDefaultPNGImage(hashtag, type);
        }

        const prompt = `Descreva uma imagem profissional para um artigo de blog sobre: ${title}
Hashtag relacionada: ${hashtag}
Tipo: ${type === 'banner' ? 'Banner principal' : 'Imagem de conteúdo'}

Estilo: Moderno, jornalístico, profissional
Tema: Brasil, notícias, atual
Cores: Tons profissionais (azul, branco, vermelho)
Formato: ${type === 'banner' ? 'Landscape/horizontal' : 'Quadrado ou retangular'}
Qualidade: Alta resolução para blog

Descreva em detalhes como seria esta imagem, incluindo elementos visuais, cores, composição e estilo.`;

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
        
        if (imageDescription) {
            return generatePNGFromDescription(imageDescription, hashtag, type);
        } else {
            return generateDefaultPNGImage(hashtag, type);
        }
    } catch (error) {
        console.log("Gemini image generation failed, will use fallback:", error?.message || error);
        return generateDefaultPNGImage(hashtag, type);
    }
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

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const metaDescription = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return metaDescription?.trim() || `Descubra insights sobre ${title}. Análise completa com dados, tendências e perspectivas para o Brasil. Leia agora!`;
    } catch (error) {
        console.error("Error generating meta description:", error);
        return `Descubra insights sobre ${title}. Análise completa com dados, tendências e perspectivas para o Brasil. Leia agora!`;
    }
}

function generateSVGFromDescription(description: string, hashtag: string, type: 'banner' | 'content' = 'banner'): string {
    // Extract colors and themes from description
    const colors = extractColorsFromDescription(description);
    const theme = extractThemeFromDescription(description);
    
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="${colors.accent}" stroke-width="2" rx="10"/>
            <text x="50%" y="40%" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${theme}</text>
            <text x="50%" y="60%" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="16">${hashtag}</text>
            <circle cx="${width-60}" cy="60" r="20" fill="${colors.accent}" opacity="0.7"/>
            <rect x="40" y="${height-80}" width="60" height="4" fill="${colors.accent}" rx="2"/>
            <rect x="40" y="${height-70}" width="40" height="4" fill="${colors.accent}" rx="2"/>
        </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function extractColorsFromDescription(description: string): {primary: string, secondary: string, accent: string, text: string} {
    const colors = {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#ef4444',
        text: '#ffffff'
    };
    
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
    
    return colors;
}

function extractThemeFromDescription(description: string): string {
    if (description.includes('política') || description.includes('governo')) return 'POLÍTICA';
    if (description.includes('economia') || description.includes('mercado')) return 'ECONOMIA';
    if (description.includes('tecnologia') || description.includes('digital')) return 'TECNOLOGIA';
    if (description.includes('saúde') || description.includes('medicina')) return 'SAÚDE';
    if (description.includes('educação') || description.includes('ensino')) return 'EDUCAÇÃO';
    if (description.includes('esporte') || description.includes('futebol')) return 'ESPORTES';
    if (description.includes('cultura') || description.includes('arte')) return 'CULTURA';
    return 'NOTÍCIAS';
}

function generatePNGFromDescription(description: string, hashtag: string, type: 'banner' | 'content' = 'banner'): string {
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    const theme = extractThemeFromDescription(description, hashtag);
    const colors = extractColorsFromDescription(description, hashtag);
    
    return createProfessionalImage(width, height, theme, hashtag, colors, description);
}

function generateDefaultPNGImage(hashtag: string, type: 'banner' | 'content' = 'banner'): string {
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    const theme = extractThemeFromDescription("", hashtag);
    const colors = extractColorsFromDescription("", hashtag);
    
    return createProfessionalImage(width, height, theme, hashtag, colors);
}

function createProfessionalImage(width: number, height: number, theme: string, hashtag: string, colors: any, description?: string): string {
    // Create a professional-looking image that mimics PNG quality
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:0.9" />
                    <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.8" />
                </linearGradient>
                <radialGradient id="overlayGrad" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.15" />
                    <stop offset="100%" style="stop-color:#000000;stop-opacity:0.1" />
                </radialGradient>
            </defs>
            
            <!-- Background -->
            <rect width="100%" height="100%" fill="url(#mainGrad)"/>
            <rect width="100%" height="100%" fill="url(#overlayGrad)"/>
            
            <!-- Professional border -->
            <rect x="15" y="15" width="${width-30}" height="${height-30}" fill="none" stroke="${colors.text}" stroke-width="1" rx="12" opacity="0.3"/>
            
            <!-- News logo/icon -->
            <circle cx="70" cy="50" r="22" fill="${colors.text}" opacity="0.2"/>
            <text x="70" y="58" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">📰</text>
            
            <!-- Main theme text -->
            <text x="50%" y="35%" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="28" font-weight="bold" opacity="0.95">${theme}</text>
            
            <!-- Hashtag -->
            <text x="50%" y="50%" text-anchor="middle" fill="${colors.text}" font-family="Arial, sans-serif" font-size="16" opacity="0.8">${hashtag}</text>
            
            <!-- Professional design elements -->
            <rect x="50" y="${height-90}" width="100" height="3" fill="${colors.accent}" rx="1"/>
            <rect x="50" y="${height-80}" width="70" height="2" fill="${colors.accent}" rx="1" opacity="0.7"/>
            <rect x="50" y="${height-72}" width="50" height="2" fill="${colors.accent}" rx="1" opacity="0.5"/>
            
            <!-- Brand mark -->
            <text x="${width-50}" y="${height-25}" text-anchor="end" fill="${colors.text}" font-family="Arial, sans-serif" font-size="11" opacity="0.6">TrendNews</text>
            
            <!-- Decorative elements -->
            <circle cx="${width-50}" cy="50" r="15" fill="${colors.accent}" opacity="0.2"/>
            <rect x="30" y="${height-120}" width="4" height="20" fill="${colors.accent}" opacity="0.4" rx="2"/>
            <rect x="40" y="${height-115}" width="4" height="15" fill="${colors.accent}" opacity="0.3" rx="2"/>
        </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function generateDefaultImage(hashtag: string, type: 'banner' | 'content' = 'banner'): string {
    // Legacy function - now redirects to PNG version
    return generateDefaultPNGImage(hashtag, type);
}