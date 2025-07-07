import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateArticleImage(
    title: string,
    hashtag: string,
): Promise<string | null> {
    try {
        const prompt = `
Crie uma imagem profissional para um artigo de blog sobre: ${title}
Hashtag relacionada: ${hashtag}

Estilo: Moderno, jornalístico, profissional
Tema: Brasil, notícias, atual
Cores: Tons profissionais (azul, branco, vermelho)
Formato: Landscape/horizontal
Qualidade: Alta resolução para blog

A imagem deve ser visualmente atraente e relacionada ao tema do artigo.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-thinking-exp",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
            },
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
            return null;
        }

        const content = candidates[0].content;
        if (!content || !content.parts) {
            return null;
        }

        for (const part of content.parts) {
            if (part.inlineData && part.inlineData.data) {
                const imageData = Buffer.from(part.inlineData.data, "base64");
                const fileName = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
                const imagePath = `client/public/images/${fileName}`;
                
                // Ensure directory exists
                const dir = 'client/public/images';
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                fs.writeFileSync(imagePath, imageData);
                console.log(`Image generated and saved: ${imagePath}`);
                return `/images/${fileName}`;
            }
        }

        return null;
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        return null;
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

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text?.trim() || `Descubra insights sobre ${title}. Análise completa com dados, tendências e perspectivas para o Brasil. Leia agora!`;
    } catch (error) {
        console.error("Error generating meta description:", error);
        return `Descubra insights sobre ${title}. Análise completa com dados, tendências e perspectivas para o Brasil. Leia agora!`;
    }
}