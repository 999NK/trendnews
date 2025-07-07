import OpenAI from "openai";
import { generateArticleImage } from "./imageGenerator";

const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || "xai-qJahcbELTK9zcnDGkrNqRrnUseGhkjJ0XZZil7LwRhMx18cteZgh2DgRo6SglMsLwOwSOdqBAgrZkTAj"
});

export interface ArticleGenerationOptions {
  hashtag: string;
  length: 'short' | 'medium' | 'long';
  style: 'informative' | 'casual' | 'formal' | 'engaging';
  language: 'pt' | 'en' | 'es';
}

export async function generateArticle(options: ArticleGenerationOptions): Promise<{
  title: string;
  content: string;
  excerpt: string;
}> {
  try {
    const { hashtag, length, style, language } = options;
    
    const lengthMap = {
      short: "600-900 palavras",
      medium: "1200-1800 palavras", 
      long: "2500-3500 palavras"
    };

    const languageMap = {
      pt: "português brasileiro",
      en: "inglês",
      es: "espanhol"
    };

    const prompt = `
Você é um jornalista sênior especializado em criar artigos profissionais para o blog de notícias "TrendNews".

Crie um artigo EXCEPCIONAL sobre: ${hashtag}

REGRAS OBRIGATÓRIAS:
1. Título atraente e claro (SEM hashtags, SEM símbolos #)
2. Introdução que prende atenção em 2 parágrafos máximo
3. Subtítulos claros e organizados hierarquicamente
4. Parágrafos curtos (máximo 3-4 linhas)
5. Incluir dados concretos e estatísticas
6. Linguagem clara, sem jargões excessivos
7. Finalizar com pergunta para engajamento

Especificações:
- Idioma: ${languageMap[language]}
- Tom: ${style}
- Extensão: ${lengthMap[length]}
- Foco: Brasil, mercado brasileiro, impacto local

Estrutura HTML:
<h1>Título Principal</h1>
<p>Introdução impactante</p>

<h2>Subtítulo Principal 1</h2>
<p>Conteúdo com dados específicos</p>

<h3>Subtópico se necessário</h3>
<p>Detalhes relevantes</p>

<h2>Subtítulo Principal 2</h2>
<p>Desenvolvimento do tema</p>

<h2>Conclusão/Perspectivas</h2>
<p>Insights e pergunta final</p>

IMPORTANTE: Use dados reais quando possível, cite fontes respeitáveis, evite repetições.

Retorne JSON:
{
  "title": "título limpo sem hashtags",
  "content": "artigo completo em HTML",
  "excerpt": "resumo atraente de 150-180 caracteres"
}
`;

    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "Você é um jornalista sênior do TrendNews, especializado em criar conteúdo de altíssima qualidade seguindo padrões jornalísticos profissionais. Sempre responda em formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.title || !result.content || !result.excerpt) {
      throw new Error("Invalid response format from Grok AI");
    }

    // Generate image for the article
    const imageUrl = generateArticleImage(result.title, options.hashtag);

    return {
      title: result.title,
      content: result.content,
      excerpt: result.excerpt,
      hashtag: options.hashtag,
      status: "draft",
      imageUrl,
      published: false
    };

  } catch (error) {
    console.error("Error generating article with Grok AI:", error);
    throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function researchTopic(hashtag: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a research assistant. Provide comprehensive background information about trending topics."
        },
        {
          role: "user",
          content: `Research and provide comprehensive information about the trending topic "${hashtag}". Include recent developments, key players, and relevant context.`
        }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "";

  } catch (error) {
    console.error("Error researching topic with Grok AI:", error);
    throw new Error(`Failed to research topic: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
