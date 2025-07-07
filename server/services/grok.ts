import OpenAI from "openai";
import { generateArticleImage } from "./imageGenerator";
import { generateArticleImage as generateGeminiImage, generateSEOMetaDescription } from './gemini';

const openai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY
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
Você é um jornalista investigativo sênior do TrendNews, especializado em criar artigos de blog profissionais, detalhados e envolventes.

Crie um artigo COMPLETO e PROFISSIONAL sobre: ${hashtag}

PADRÕES OBRIGATÓRIOS DE BLOG PROFISSIONAL:

1. TÍTULO ULTRA-ATRAENTE E PROFISSIONAL
- Chamativo mas jornalístico (evite clickbait extremo)
- Sem hashtags ou símbolos especiais
- Foque em benefícios, curiosidades ou impacto
- NUNCA use hashtags (#) no título
- Desperte curiosidade máxima
- Exemplos: "O Escândalo que Abala o Brasil", "A Verdade que Ninguém Conta"

2. INTRODUÇÃO MAGNÉTICA E HUMANIZADA
- 2-3 parágrafos envolventes com narrativa pessoal ou caso real
- Contextualiza com dados relevantes e histórias humanas
- Conecta emocionalmente com o leitor desde o início
- Use storytelling para apresentar o tema

3. ARGUMENTOS BALANCEADOS E APROFUNDADOS
- Sempre apresente PRÓS E CONTRAS com desenvolvimento completo
- Seção específica: "Dois Lados da Questão" com 4-5 parágrafos cada lado
- Múltiplas perspectivas de especialistas com citações diretas
- Dados contrastantes e análises detalhadas
- Exemplos concretos para cada argumento

4. ESTRUTURA HUMANIZADA E ORGANIZADA
- Subtítulos (H2, H3) criativos e envolventes
- Parágrafos desenvolvidos (4-6 linhas) com conteúdo substancial
- Listas detalhadas com explicações completas
- Fluxo narrativo natural e fácil leitura
- Cada seção deve ter conteúdo robusto, não superficial

5. CONTEÚDO HUMANIZADO E RELEVANTE
- Dados concretos com contexto e interpretação humana
- Histórias reais de brasileiros afetados pelo tema
- Fontes respeitáveis com citações diretas e completas
- Linguagem natural e envolvente, zero repetições
- Depoimentos e experiências pessoais quando relevante

6. LINGUAGEM HUMANIZADA E PROFISSIONAL
- Linguagem conversacional mas respeitosa
- Frases naturais que soam como conversa inteligente
- Português brasileiro rico e correto
- Tom ${style} mas caloroso e acessível
- Evite robotização, seja genuinamente humano

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
<li>Ponto favorável 1 com dados</li>
<li>Ponto favorável 2 com evidências</li>
<li>Ponto favorável 3 com estatísticas</li>
</ul>

<h3>Argumentos Contrários</h3>
<ul>
<li>Ponto contrário 1 com dados</li>
<li>Ponto contrário 2 com evidências</li>
<li>Ponto contrário 3 com estatísticas</li>
</ul>

<h2>Análise Aprofundada: Entendendo o Fenômeno</h2>
<p>Desenvolvimento detalhado com múltiplas camadas de análise, contexto histórico e comparações internacionais.</p>
<p>Explicação das causas, consequências e conexões mais amplas do tema.</p>
<p>Análise crítica das implicações e possíveis cenários futuros.</p>

<h2>O Impacto Real no Dia a Dia dos Brasileiros</h2>
<p>Como isso afeta concretamente a vida das pessoas, com exemplos específicos de diferentes regiões.</p>
<p>Depoimentos e histórias reais de pessoas impactadas pela situação.</p>
<p>Diferenças regionais e socioeconômicas na experiência do fenômeno.</p>

<h2>Vozes dos Especialistas</h2>
<p>Citações detalhadas e análises de especialistas renomados no assunto.</p>
<p>Diferentes escolas de pensamento e abordagens acadêmicas.</p>
<p>Previsões e recomendações baseadas em evidências.</p>

<h2>Por Trás dos Números: Dados que Contam Histórias</h2>
<p>Informações quantitativas contextualizadas e interpretadas de forma humana.</p>
<p>Comparações temporais e geográficas que revelam tendências.</p>
<p>Tradução de estatísticas em impactos reais e compreensíveis.</p>

<h2>Conclusão</h2>
<p>Síntese final com call-to-action para engajamento.</p>

IMPORTANTE - CRIAÇÃO HUMANIZADA E PROFISSIONAL: 
- Conte uma HISTÓRIA envolvente com narrativa fluida, não apenas liste fatos
- Use TRANSIÇÕES suaves e naturais entre seções
- Inclua EXEMPLOS PRÁTICOS, CASOS REAIS e TESTEMUNHOS
- Desenvolva cada seção com CONTEÚDO SUBSTANCIAL (mínimo 3-4 parágrafos por seção)
- Mantenha o leitor ENGAJADO com linguagem conversacional mas profissional
- Use DADOS ESPECÍFICOS, estatísticas reais e citações quando possível
- Evite seções superficiais ou com pouco conteúdo
- Adicione CONTEXTO HISTÓRICO e COMPARAÇÕES relevantes
- Inclua VOZES DIFERENTES (especialistas, pessoas comuns, autoridades)
- NUNCA mencione que o conteúdo foi gerado por IA
- Escreva como um jornalista experiente e renomado escreveria
- Torne o artigo COMPLETO e APROFUNDADO, não superficial

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
      max_tokens: 4000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.title || !result.content || !result.excerpt) {
      throw new Error("Invalid response format from Grok AI");
    }

    // Generate image with Gemini AI or fallback to generic image
    let imageUrl = await generateGeminiImage(result.title, options.hashtag);
    if (!imageUrl) {
      imageUrl = generateArticleImage(result.title, options.hashtag);
    }
    
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
