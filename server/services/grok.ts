import OpenAI from "openai";
import { generateArticleImage } from "./imageGenerator";
import {
  generateArticleImage as generateGeminiImage,
  generateSEOMetaDescription,
} from "./gemini";

const openai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

export interface ArticleGenerationOptions {
  hashtag: string;
  length: "short" | "medium" | "long";
  style: "informative" | "casual" | "formal" | "engaging";
  language: "pt" | "en" | "es";
}

export interface ArticleGenerationResult {
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  contentImageUrl?: string;
  metaDescription?: string;
  seoKeywords?: string;
}

export async function researchTopic(hashtag: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-3", // Usa Grok 3 para acesso a posts do X
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente de pesquisa com acesso a posts públicos do X em tempo real. Forneça um resumo detalhado e conciso sobre hashtags em alta, focando no contexto brasileiro.",
        },
        {
          role: "user",
          content: `Pesquise a hashtag "${hashtag}" no X no Brasil e forneça um resumo detalhado (máximo 500 palavras) com:
          - **Contexto**: Por que a hashtag está em alta? Qual evento, notícia ou debate a impulsionou?
          - **Temas Principais**: Quais subtemas ou questões estão sendo discutidos?
          - **Sentimento Geral**: Positivo, negativo ou neutro? Qual é o tom predominante?
          - **Exemplos de Posts**: Resuma 2-3 posts relevantes (sem citar nomes reais de usuários).
          - **Impacto Cultural/Social**: Como a hashtag afeta o Brasil (ex.: regiões, grupos sociais)?
          - **Dados Quantitativos**: Número estimado de posts, alcance ou menções, se disponível.
          - **Fontes Relevantes**: Mencione fontes confiáveis (ex.: mídia, relatórios) relacionadas ao tema, se aplicável.`,
        },
      ],
      max_tokens: 1000, // Limite para um resumo conciso
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Erro ao pesquisar tópico com Grok 3:", error);
    throw new Error(
      `Falha na pesquisa do tópico: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    );
  }
}

export async function generateArticle(
  options: ArticleGenerationOptions,
): Promise<ArticleGenerationResult> {
  try {
    const { hashtag, length, style, language } = options;

    const lengthMap = {
      short: "600-900 palavras",
      medium: "1200-1800 palavras",
      long: "2500-3500 palavras",
    };

    const languageMap = {
      pt: "português brasileiro",
      en: "inglês",
      es: "espanhol",
    };

    // Obter contexto detalhado da hashtag no X
    const hashtagContext = await researchTopic(hashtag);

    const prompt = `
    Você é um jornalista investigativo sênior do TrendNews, especializado em criar notícias profissionais, profundamente humanizadas, envolventes e narrativas, no estilo de "A Jornada de Ozzy Osbourne: Do Pioneirismo no Heavy Metal ao Ícone Cultural no Brasil". Sua missão é produzir uma notícia cativante que reflita as discussões reais da hashtag no X, com uma narrativa fluida, emocional e jornalística, sem qualquer tom genérico ou robótico.

**Contexto da Hashtag no X**:
${hashtagContext}

Crie uma NOTÍCIA COMPLETA e PROFISSIONAL sobre a hashtag "${hashtag}", com base nas discussões atuais no X no Brasil. O artigo deve capturar os temas, sentimentos e exemplos mencionados no contexto, evitando narrativas genéricas e focando no que está sendo debatido. Use exemplos de posts do X (resumidos, sem nomes reais) para embasar a narrativa e destacar o impacto no Brasil.

**PADRÕES OBRIGATÓRIOS**:

1. **Título principal (h1)**: Máximo 15 palavras. Evite hashtags, emojis e clickbait.

2. **Introdução**: 3–4 parágrafos narrativos baseados no X, com conexão emocional real.

3. **Seções com título (h2)**: 
   - O título **vem depois dos parágrafos da seção**.
   - Deve ser gerado **com base específica** no conteúdo da seção anterior.
   - ❌ Nunca use padrões genéricos como “Análise”, “Impacto”, “Debate nas redes”.
   - ✅ O título deve incluir pelo menos dois termos reais usados nos parágrafos anteriores (como regiões, grupos sociais, sentimentos ou situações discutidas).
   - Exemplo bom: “Da Revolta à Esperança: O Clamor das Enfermeiras no Norte do Brasil”.

4. **Estilo e estrutura**:
   - Cada seção: 3–5 parágrafos robustos (4–6 linhas), sem superficialidade.
   - Narrativa fluida e envolvente.
   - Use 2–3 exemplos reais de posts (resumidos) do X.

5. **Análise e impacto**:
   - Mostre os dois lados do debate naturalmente.
   - Inclua falas de especialistas reais ou fictícios (com credibilidade).
   - Explore impactos regionais, sociais e emocionais no Brasil.

6. **Dados e estatísticas**:
   - Relacione números a histórias reais e sentimentos.
   - Contextualize com comparações regionais ou temporais.

7. **SEO e CTA**:
   - Use 15–20 palavras-chave naturais.
   - Gere excerpt com 150–180 caracteres.
   - Termine com CTA provocativo.

**FORMATO HTML OBRIGATÓRIO**:
<h1>Título ultra-atraente</h1>
<p>Parágrafo 1 - introdução</p>
<p>Parágrafo 2 - introdução</p>
<p>Parágrafo 3 - introdução</p>
<p>Parágrafo 4 - introdução (se necessário)</p>

<p>Parágrafo 1 da seção</p>
<p>Parágrafo 2 da seção</p>
<p>Parágrafo 3 da seção</p>
<h2>Título específico e criativo com base nos parágrafos acima</h2>

<p>Parágrafo 1 da próxima seção</p>
<p>Parágrafo 2 da próxima seção</p>
<p>Parágrafo 3 da próxima seção</p>
<h2>Outro título gerado com base nos parágrafos acima</h2>

<p>Parágrafo 1 da próxima seção</p>
<p>Parágrafo 2 da próxima seção</p>
<p>Parágrafo 3 da próxima seção</p>
<h2>Outro título gerado com base nos parágrafos acima</h2>

<p>Parágrafo 1 da nova seção</p>
<p>Parágrafo 2 da nova seção</p>
<p>Parágrafo 3 da nova seção</p>
<h2>Mais um título contextual, gerado após os parágrafos</h2>

<p>Parágrafo 1 da última seção analítica</p>
<p>Parágrafo 2 da última seção analítica</p>
<p>Parágrafo 3 da última seção analítica</p>
<h2>Título final baseado no conteúdo da seção acima</h2>

**IMPORTANTE**:
- Todos os títulos <h2> devem vir somente **após** os parágrafos da seção correspondente.
- Cada título <h2> deve refletir com precisão os temas, emoções, conflitos ou histórias citadas na seção anterior.
- Não use títulos genéricos, mesmo que pareçam jornalísticos. Seja criativo, específico e ancorado no texto.


<p>Conclusão envolvente com CTA instigante.</p>

**INSTRUÇÕES FINAIS**:
- Gere os títulos H2 somente **depois dos parágrafos** da seção.
- Cada título deve ser único, descritivo, emocional e com base clara no conteúdo anterior.
- Retorne um JSON válido com:

{
  "title": "título ultra-atraente sem hashtags",
  "content": "artigo completo em HTML",
  "excerpt": "resumo de 150-180 caracteres",
  "seoKeywords": "15-20 palavras-chave, separadas por vírgulas"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "grok-3", // Usa Grok 3 para acesso ao X
      messages: [
        {
          role: "system",
          content:
            "Você é um jornalista sênior do TrendNews, com acesso a posts do X em tempo real. Crie notícias profissionais, humanizadas e envolventes, refletindo discussões atuais. Responda em JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 6000, // Aumentado para suportar artigos longos e detalhados
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    if (!result.title || !result.content || !result.excerpt) {
      throw new Error("Formato de resposta inválido do Grok 3");
    }

    // Gerar 2 imagens por artigo
    let bannerImageUrl = await generateGeminiImage(result.title, options.hashtag, 'banner');
    let contentImageUrl = await generateGeminiImage(result.title, options.hashtag, 'content');
    
    // Fallback para imagens padrão se necessário
    if (!bannerImageUrl) {
      bannerImageUrl = generateArticleImage(result.title, options.hashtag);
    }
    if (!contentImageUrl) {
      contentImageUrl = generateArticleImage(result.title, options.hashtag);
    }

    // Gerar meta descrição SEO
    const metaDescription = await generateSEOMetaDescription(
      result.title,
      result.content,
    );

    return {
      title: result.title,
      content: result.content,
      excerpt: result.excerpt,
      imageUrl: bannerImageUrl || undefined, // Backward compatibility
      bannerImageUrl: bannerImageUrl || undefined,
      contentImageUrl: contentImageUrl || undefined,
      metaDescription: metaDescription || undefined,
      seoKeywords: result.seoKeywords || undefined,
    };
  } catch (error) {
    console.error("Erro ao gerar notícia com Grok 3:", error);
    throw new Error(
      `Falha na geração da notícia: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    );
  }
}
