export async function generateArticleImage(
    title: string,
    hashtag: string,
    type: 'banner' | 'content' = 'banner'
): Promise<string> {
    try {
        // Import the new image generation service
        const { generateImageFromDescription } = await import('./imageGeneration.js');
        
        if (!process.env.GEMINI_API_KEY) {
            console.log("Gemini API key not found, using fallback");
            return generateDefaultPNGImage(hashtag, type);
        }

        // Create a comprehensive description for image generation
        const contextDescription = `Artigo: ${title}. Hashtag: ${hashtag}. Tema brasileiro, notícias atuais, jornalismo profissional.`;
        
        return await generateImageFromDescription(contextDescription, hashtag, type);
    } catch (error) {
        console.log("Advanced image generation failed, using fallback:", error?.message || error);
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
    // Extract key themes from description for better image selection
    const cleanHashtag = hashtag.replace('#', '').replace(/[^a-zA-Z0-9]/g, '');
    const lowerDescription = description.toLowerCase();
    
    // Create a seed based on description content
    const seed = description.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    
    // Map description themes to appropriate Unsplash categories
    let category = 'business';
    let searchTerm = 'business,office';
    
    if (lowerDescription.includes('política') || lowerDescription.includes('governo') || lowerDescription.includes('eleição')) {
        category = 'politics';
        searchTerm = 'government,politics,congress';
    } else if (lowerDescription.includes('economia') || lowerDescription.includes('dinheiro') || lowerDescription.includes('mercado')) {
        category = 'finance';
        searchTerm = 'finance,money,economy';
    } else if (lowerDescription.includes('tecnologia') || lowerDescription.includes('digital') || lowerDescription.includes('internet')) {
        category = 'technology';
        searchTerm = 'technology,computer,digital';
    } else if (lowerDescription.includes('saúde') || lowerDescription.includes('medicina') || lowerDescription.includes('hospital')) {
        category = 'health';
        searchTerm = 'health,medicine,hospital';
    } else if (lowerDescription.includes('educação') || lowerDescription.includes('escola') || lowerDescription.includes('universidade')) {
        category = 'education';
        searchTerm = 'education,school,learning';
    } else if (lowerDescription.includes('esporte') || lowerDescription.includes('futebol') || lowerDescription.includes('atleta')) {
        category = 'sports';
        searchTerm = 'sports,football,athlete';
    } else if (lowerDescription.includes('cultura') || lowerDescription.includes('arte') || lowerDescription.includes('música')) {
        category = 'culture';
        searchTerm = 'culture,art,music';
    } else if (lowerDescription.includes('natureza') || lowerDescription.includes('ambiente') || lowerDescription.includes('clima')) {
        category = 'nature';
        searchTerm = 'nature,environment,landscape';
    }
    
    // Generate consistent image based on theme and hashtag
    const imageId = Math.abs(seed) % 500 + 100;
    
    // Use curated Picsum images based on theme categories
    // Each category has specific image IDs that work well for that theme
    let imageIds = [];
    
    if (category === 'politics') {
        imageIds = [1, 7, 12, 23, 31, 48, 67, 89, 102, 134]; // Architectural/formal images
    } else if (category === 'finance') {
        imageIds = [2, 11, 22, 35, 44, 59, 78, 91, 105, 127]; // Urban/business imagery
    } else if (category === 'technology') {
        imageIds = [3, 13, 28, 39, 52, 68, 83, 96, 114, 142]; // Modern/clean images
    } else if (category === 'health') {
        imageIds = [4, 17, 29, 41, 56, 73, 88, 103, 119, 145]; // Nature/wellness images
    } else if (category === 'education') {
        imageIds = [5, 19, 32, 45, 61, 76, 92, 107, 123, 148]; // Learning/study environments
    } else if (category === 'sports') {
        imageIds = [6, 21, 34, 47, 63, 79, 94, 109, 126, 151]; // Dynamic/active images
    } else if (category === 'culture') {
        imageIds = [8, 24, 37, 51, 66, 82, 97, 112, 129, 154]; // Artistic/cultural images
    } else if (category === 'nature') {
        imageIds = [9, 26, 40, 54, 69, 85, 100, 116, 132, 157]; // Natural landscapes
    } else {
        imageIds = [10, 27, 42, 57, 72, 87, 104, 118, 135, 160]; // General business/professional
    }
    
    // Select specific image based on content hash
    const selectedId = imageIds[Math.abs(seed) % imageIds.length];
    const imageUrls = [
        `https://picsum.photos/${width}/${height}?random=${selectedId}`,
        `https://picsum.photos/${width}/${height}?random=${selectedId + 500}`,
        `https://picsum.photos/${width}/${height}?random=${selectedId + 1000}`
    ];
    
    return imageUrls[Math.abs(seed) % imageUrls.length];
}

function generateDefaultPNGImage(hashtag: string, type: 'banner' | 'content' = 'banner'): string {
    const cleanHashtag = hashtag.replace('#', '').replace(/[^a-zA-Z0-9]/g, '');
    const width = type === 'banner' ? 800 : 400;
    const height = type === 'banner' ? 400 : 400;
    
    // Generate a consistent image based on hashtag
    const seed = hashtag.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    const imageId = Math.abs(seed) % 500 + 100;
    
    // Use thematic images based on hashtag content
    const lowerHashtag = hashtag.toLowerCase();
    let searchTerm = 'news,brasil';
    
    if (lowerHashtag.includes('politica') || lowerHashtag.includes('governo') || lowerHashtag.includes('congresso')) {
        searchTerm = 'politics,government,brasil';
    } else if (lowerHashtag.includes('economia') || lowerHashtag.includes('dinheiro') || lowerHashtag.includes('imposto')) {
        searchTerm = 'finance,economy,money';
    } else if (lowerHashtag.includes('tecnologia') || lowerHashtag.includes('digital')) {
        searchTerm = 'technology,computer,digital';
    } else if (lowerHashtag.includes('saude') || lowerHashtag.includes('medicina')) {
        searchTerm = 'health,medicine,hospital';
    } else if (lowerHashtag.includes('educacao') || lowerHashtag.includes('escola')) {
        searchTerm = 'education,school,learning';
    } else if (lowerHashtag.includes('esporte') || lowerHashtag.includes('futebol')) {
        searchTerm = 'sports,football,brasil';
    }
    
    // Use curated Picsum images based on hashtag theme
    let imageIds = [];
    
    if (lowerHashtag.includes('politica') || lowerHashtag.includes('governo') || lowerHashtag.includes('congresso')) {
        imageIds = [1, 7, 12, 23, 31, 48, 67, 89, 102, 134]; // Political/architectural
    } else if (lowerHashtag.includes('economia') || lowerHashtag.includes('dinheiro') || lowerHashtag.includes('imposto')) {
        imageIds = [2, 11, 22, 35, 44, 59, 78, 91, 105, 127]; // Finance/business
    } else if (lowerHashtag.includes('tecnologia') || lowerHashtag.includes('digital')) {
        imageIds = [3, 13, 28, 39, 52, 68, 83, 96, 114, 142]; // Technology/modern
    } else if (lowerHashtag.includes('saude') || lowerHashtag.includes('medicina')) {
        imageIds = [4, 17, 29, 41, 56, 73, 88, 103, 119, 145]; // Health/nature
    } else if (lowerHashtag.includes('educacao') || lowerHashtag.includes('escola')) {
        imageIds = [5, 19, 32, 45, 61, 76, 92, 107, 123, 148]; // Education/learning
    } else if (lowerHashtag.includes('esporte') || lowerHashtag.includes('futebol')) {
        imageIds = [6, 21, 34, 47, 63, 79, 94, 109, 126, 151]; // Sports/dynamic
    } else {
        imageIds = [10, 27, 42, 57, 72, 87, 104, 118, 135, 160]; // General news/business
    }
    
    // Select specific image based on hashtag hash
    const selectedId = imageIds[Math.abs(seed) % imageIds.length];
    const imageUrls = [
        `https://picsum.photos/${width}/${height}?random=${selectedId}`,
        `https://picsum.photos/${width}/${height}?random=${selectedId + 300}`,
        `https://picsum.photos/${width}/${height}?random=${selectedId + 600}`
    ];
    
    return imageUrls[Math.abs(seed) % imageUrls.length];
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