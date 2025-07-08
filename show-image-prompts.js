// Script to show the actual prompts used for image generation
import { storage } from './server/storage.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

async function showImagePrompts() {
  try {
    // Get the latest article (ID 5)
    const article = await storage.getArticle(5);
    if (!article) {
      console.log('Article not found');
      return;
    }
    
    console.log('='.repeat(80));
    console.log('PROMPT PARA GERAR IMAGENS PROFISSIONAIS');
    console.log('='.repeat(80));
    console.log(`Artigo: "${article.title}"`);
    console.log(`Hashtag: ${article.hashtag}`);
    console.log('='.repeat(80));
    
    // Show the Grok analysis prompt (Step 1)
    const analysisPrompt = `Analise este artigo completo e forneça APENAS uma descrição profissional para uma foto genérica sobre o tema:

ARTIGO COMPLETO:
${article.content}

TÍTULO: ${article.title}
HASHTAG: ${article.hashtag}

Baseado no conteúdo real do artigo, descreva uma imagem banner horizontal (800x400) que seja:

1. **Foto genérica e profissional** sobre o tema principal do artigo
2. **Adequada para jornalismo brasileiro** - ambiente, contexto, pessoas brasileiras
3. **Visualmente impactante** e **contextualmente relevante** ao conteúdo
4. **Sem texto, logos ou elementos gráficos** - apenas a descrição da cena/ambiente/pessoas

CATEGORIAS PRINCIPAIS:
- Política: Congresso Nacional, Planalto, gabinetes, reuniões oficiais, manifestações
- Economia: Centros financeiros, bolsa de valores, comércio, empresas, trabalhadores
- Tecnologia: Escritórios modernos, dispositivos, startups, inovação, desenvolvimento
- Saúde: Hospitais, laboratórios, médicos, enfermeiros, equipamentos médicos
- Educação: Escolas, universidades, estudantes, professores, salas de aula
- Meio Ambiente: Natureza brasileira, sustentabilidade, energia renovável
- Esportes: Estádios, atletas, competições, torcedores, modalidades específicas
- Sociedade: Pessoas, comunidades, vida urbana, diversidade, trabalho

IMPORTANTE: A descrição deve ser específica ao tema do artigo, não genérica.

Retorne APENAS a descrição da foto em português, sem introduções ou explicações:`;

    console.log('\n1️⃣ PROMPT PARA GROK AI (ANÁLISE DO ARTIGO):');
    console.log('-'.repeat(60));
    console.log(analysisPrompt);
    
    // Generate the description to show what Grok would return
    console.log('\n🔄 Gerando descrição com Grok AI...');
    const analysisResponse = await openai.chat.completions.create({
      model: "grok-3",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em fotojornalismo brasileiro. Analise artigos e sugira fotos profissionais contextualmente relevantes baseadas no conteúdo específico."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    const imageDescription = analysisResponse.choices[0].message.content || "";
    
    console.log('\n📸 DESCRIÇÃO GERADA PELO GROK:');
    console.log('-'.repeat(60));
    console.log(imageDescription);
    
    // Show the Gemini prompt (Step 2)
    const geminiPrompt = `Gere uma descrição detalhada para criar uma imagem PNG sobre o tema: "${imageDescription}" relacionado à hashtag "${article.hashtag}".

Tipo de imagem: banner horizontal
Dimensões: 800x400

Descreva uma composição visual profissional para blog de notícias brasileiro que inclua:
1. Cenário ou ambiente relacionado ao tema (política, economia, tecnologia, esportes, etc.)
2. Elementos visuais brasileiros quando relevante
3. Cores modernas e profissionais (tons de vermelho, branco, cinza)
4. Estilo jornalístico limpo e atual
5. Composição adequada para banner de artigo

Retorne APENAS uma descrição visual detalhada em português para criação da imagem, sem código ou tags:`;

    console.log('\n2️⃣ PROMPT PARA GEMINI AI (GERAÇÃO DA IMAGEM):');
    console.log('-'.repeat(60));
    console.log(geminiPrompt);
    
    console.log('\n' + '='.repeat(80));
    console.log('FLUXO COMPLETO:');
    console.log('='.repeat(80));
    console.log('1. Artigo completo → Grok AI (análise contextual)');
    console.log('2. Descrição contextual → Gemini AI (criação da imagem PNG)');
    console.log('3. Imagem PNG profissional → Salva e servida no blog');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

showImagePrompts().then(() => {
  console.log('✅ Prompts exibidos com sucesso!');
  process.exit(0);
});