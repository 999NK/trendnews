export async function generateArticleImage(
    title: string,
    hashtag: string,
    type: 'banner' | 'content' = 'banner'
): Promise<string> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.log("Gemini API key not found, using fallback");
            return generateDefaultImage(hashtag, type);
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
            return generateSVGFromDescription(imageDescription, hashtag, type);
        } else {
            return generateDefaultImage(hashtag, type);
        }
    } catch (error) {
        console.log("Gemini image generation failed, will use fallback:", error?.message || error);
        return generateDefaultImage(hashtag, type);
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

function generateDefaultImage(hashtag: string, type: 'banner' | 'content' = 'banner'): string {
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#defaultGrad)"/>
            <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="#ef4444" stroke-width="2" rx="10"/>
            <text x="50%" y="40%" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">TrendNews</text>
            <text x="50%" y="60%" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="16">${hashtag}</text>
            <circle cx="${width-60}" cy="60" r="20" fill="#ef4444" opacity="0.7"/>
            <rect x="40" y="${height-80}" width="60" height="4" fill="#ef4444" rx="2"/>
            <rect x="40" y="${height-70}" width="40" height="4" fill="#ef4444" rx="2"/>
        </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}