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
Você é um jornalista sênior do TrendNews especializado em criar posts de blog de alta qualidade.

Crie um artigo profissional sobre: ${hashtag}

PADRÕES OBRIGATÓRIOS DE BLOG:

1. TÍTULO ATRAENTE
- Claro, chamativo e que resume o tema
- NUNCA use hashtags (#) no título
- Deve despertar curiosidade

2. INTRODUÇÃO IMPACTANTE  
- Máximo 2 parágrafos curtos
- Contextualiza o tema
- Prende a atenção do leitor

3. ESTRUTURA ORGANIZADA
- Subtítulos (H2, H3) hierárquicos e claros
- Parágrafos curtos (2-3 linhas máximo)
- Listas com bullet points quando apropriado
- Fácil escaneabilidade

4. CONTEÚDO ORIGINAL E RELEVANTE
- Dados concretos e estatísticas específicas
- Exemplos práticos brasileiros
- Fontes respeitáveis quando possível
- Zero repetições de frases

5. LINGUAGEM CLARA E OBJETIVA
- Evite jargões excessivos
- Frases diretas e impactantes
- Português brasileiro correto
- Tom ${style} mas acessível

6. CHAMADA PARA AÇÃO
- Termine com pergunta envolvente
- Incentive comentários e discussão

7. SEO NATURAL
- Palavras-chave naturais sobre o tema
- Conteúdo de ${lengthMap[length]}

Especificações:
- Idioma: ${languageMap[language]}
- Foco: Brasil e impacto local
- Tom: ${style}

FORMATO HTML OBRIGATÓRIO:
<h1>Título Principal (sem #)</h1>
<p>Introdução impactante - parágrafo 1</p>
<p>Introdução impactante - parágrafo 2</p>

<h2>Subtítulo Principal</h2>
<p>Parágrafo curto com dados específicos.</p>
<p>Outro parágrafo breve e objetivo.</p>

<h3>Subtópico Específico</h3>
<ul>
<li>Ponto relevante 1</li>
<li>Ponto relevante 2</li>
<li>Ponto relevante 3</li>
</ul>

<h2>Outro Subtítulo Importante</h2>
<p>Desenvolvimento com exemplos brasileiros.</p>

<h2>Perspectivas e Conclusão</h2>
<p>Insights finais com pergunta para engajamento.</p>

RETORNE JSON VÁLIDO:
{
  "title": "título profissional sem hashtags",
  "content": "artigo completo em HTML seguindo estrutura",
  "excerpt": "resumo atraente de 150-180 caracteres para despertar interesse"
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
