// Script to regenerate images for existing articles using the new professional system
import { storage } from './server/storage.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

// Professional image generation function
async function generateProfessionalImage(articleContent, title, hashtag, type) {
  try {
    const analysisPrompt = `Analise este artigo completo e forneça APENAS uma descrição profissional para uma foto genérica sobre o tema:

ARTIGO COMPLETO:
${articleContent}

TÍTULO: ${title}
HASHTAG: ${hashtag}

Baseado no conteúdo real do artigo, descreva uma imagem ${type === 'banner' ? 'banner horizontal (800x400)' : 'quadrada (400x400)'} que seja:

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
    console.log(`📸 ${type} description generated:`, imageDescription.substring(0, 100) + '...');
    
    // Generate image using Gemini with the contextual description
    const { generateArticleImage } = await import('./server/services/gemini.js');
    return await generateArticleImage(imageDescription, hashtag, type);
  } catch (error) {
    console.error(`❌ Error generating ${type} image:`, error.message);
    // Fallback to generic image
    const { generateArticleImage } = await import('./server/services/imageGenerator.js');
    return generateArticleImage(title, hashtag);
  }
}

async function regenerateAllImages() {
  try {
    console.log('🚀 Starting image regeneration for existing articles...\n');
    
    // Get all articles
    const articles = await storage.getArticles();
    console.log(`📊 Found ${articles.length} articles to process\n`);
    
    for (const article of articles) {
      console.log(`\n🔄 Processing Article ID ${article.id}: "${article.title}"`);
      console.log(`📝 Hashtag: ${article.hashtag}`);
      
      try {
        // Generate banner image
        console.log('🖼️ Generating banner image...');
        const bannerImageUrl = await generateProfessionalImage(
          article.content, 
          article.title, 
          article.hashtag, 
          'banner'
        );
        
        // Generate content image
        console.log('🖼️ Generating content image...');
        const contentImageUrl = await generateProfessionalImage(
          article.content, 
          article.title, 
          article.hashtag, 
          'content'
        );
        
        // Update article in database
        const updatedArticle = await storage.updateArticle(article.id, {
          bannerImageUrl,
          contentImageUrl,
          imageUrl: bannerImageUrl // For backward compatibility
        });
        
        if (updatedArticle) {
          console.log('✅ Images updated successfully!');
          console.log(`   Banner: ${bannerImageUrl ? '✔️' : '❌'}`);
          console.log(`   Content: ${contentImageUrl ? '✔️' : '❌'}`);
        } else {
          console.log('❌ Failed to update article in database');
        }
        
      } catch (error) {
        console.error(`❌ Error processing article ${article.id}:`, error.message);
        continue;
      }
      
      // Add delay to avoid rate limiting
      console.log('⏳ Waiting 2 seconds before next article...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 Image regeneration completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the regeneration
regenerateAllImages().then(() => {
  console.log('✨ All done! Check your articles for new professional images.');
  process.exit(0);
});