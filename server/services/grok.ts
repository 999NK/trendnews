import OpenAI from "openai";
import { generateArticleImage } from "./imageGenerator";
import { generateArticleImage as generateGeminiImage, generateSEOMetaDescription } from './gemini';

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

export interface ArticleGenerationResult {
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  metaDescription?: string;
  seoKeywords?: string;
}

export async function generateArticle(options: ArticleGenerationOptions): Promise<ArticleGenerationResult> {
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
Você é um jornalista sênior do TrendNews especializado em criar posts de blog de alta qualidade e viralizáveis.

Crie um artigo EXCEPCIONAL sobre: ${hashtag}

PADRÕES OBRIGATÓRIOS DE BLOG PROFISSIONAL:

1. TÍTULO ULTRA-ATRAENTE
- Chamativo e impactante (pode ser ligeiramente tendencioso)
- NUNCA use hashtags (#) no título
- Desperte curiosidade máxima
- Exemplos: "O Escândalo que Abala o Brasil", "A Verdade que Ninguém Conta"

2. INTRODUÇÃO MAGNÉTICA
- Máximo 2 parágrafos curtos e impactantes
- Contextualiza com dados chocantes
- Prende atenção imediatamente

3. ARGUMENTOS BALANCEADOS OBRIGATÓRIOS
- Sempre apresente PRÓS E CONTRAS
- Seção específica: "Dois Lados da Questão"
- Múltiplas perspectivas especialistas
- Dados contrastantes

4. ESTRUTURA ORGANIZADA
- Subtítulos (H2, H3) hierárquicos e claros
- Parágrafos curtos (2-3 linhas máximo)
- Listas com bullet points
- Fácil escaneabilidade

5. CONTEÚDO ORIGINAL E RELEVANTE
- Dados concretos e estatísticas específicas
- Exemplos práticos brasileiros
- Fontes respeitáveis citadas
- Zero repetições de frases

6. LINGUAGEM CLARA E OBJETIVA
- Evite jargões excessivos
- Frases diretas e impactantes
- Português brasileiro correto
- Tom ${style} mas acessível

7. CTAs PARA ENGAJAMENTO MÁXIMO
- Termine com pergunta controversa
- Incentive compartilhamento
- Chame para debate
- Exemplo: "E você, concorda com essa decisão? Compartilhe sua opinião!"

8. SEO ULTRA-OTIMIZADO
- Inclua MUITAS palavras-chave relacionadas
- Variações do tema principal
- Termos trending brasileiros
- Conteúdo de ${lengthMap[length]}

9. ELEMENTOS VISUAIS PREPARADOS
- Inclua sugestões de imagens
- Pontos para gráficos/infográficos
- Dados que merecem visualização

Especificações:
- Idioma: ${languageMap[language]}
- Foco: Brasil e impacto local
- Tom: ${style}

FORMATO HTML OBRIGATÓRIO:
<h1>Título Ultra-Atraente (sem #)</h1>
<p>Introdução magnética - parágrafo 1</p>
<p>Introdução magnética - parágrafo 2</p>

<h2>Os Fatos Que Você Precisa Saber</h2>
<p>Dados específicos e impactantes.</p>

<h2>Dois Lados da Questão</h2>
<h3>Argumentos Favoráveis</h3>
<ul>
<li>Ponto favorável 1</li>
<li>Ponto favorável 2</li>
<li>Ponto favorável 3</li>
</ul>

<h3>Argumentos Contrários</h3>
<ul>
<li>Ponto contrário 1</li>
<li>Ponto contrário 2</li>
<li>Ponto contrário 3</li>
</ul>

<h2>Impacto no Brasil</h2>
<p>Desenvolvimento com exemplos brasileiros.</p>

<h2>O Que Especialistas Dizem</h2>
<p>Opinião de especialistas e análises.</p>

<h2>Perspectivas e Conclusão</h2>
<p>Insights finais com CTA para engajamento máximo.</p>

RETORNE JSON VÁLIDO:
{
  "title": "título ultra-atraente sem hashtags",
  "content": "artigo completo em HTML seguindo estrutura",
  "excerpt": "resumo atraente de 150-180 caracteres para despertar interesse",
  "seoKeywords": "lista de palavras-chave separadas por vírgulas, mínimo 15 termos"
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

    // Generate image with Gemini AI
    const imageUrl = await generateGeminiImage(result.title, options.hashtag);
    
    // Generate SEO meta description
    const metaDescription = await generateSEOMetaDescription(result.title, result.content);

    return {
      title: result.title,
      content: result.content,
      excerpt: result.excerpt,
      imageUrl: imageUrl || undefined,
      metaDescription: metaDescription || undefined,
      seoKeywords: result.seoKeywords || undefined,
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
