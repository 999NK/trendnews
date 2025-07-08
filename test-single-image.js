// Quick test to regenerate images for a single article
import { storage } from './server/storage.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

async function testSingleArticle() {
  try {
    console.log('Testing professional image generation...');
    
    // Get the first article
    const articles = await storage.getArticles();
    if (articles.length === 0) {
      console.log('No articles found');
      return;
    }
    
    const article = articles[0];
    console.log(`Testing with article: "${article.title}"`);
    
    // Generate description using Grok
    const analysisPrompt = `Analise este artigo e gere uma descrição de imagem:

TÍTULO: ${article.title}
HASHTAG: ${article.hashtag}
CONTEÚDO: ${article.content.substring(0, 1000)}...

Descreva uma foto profissional para jornalismo brasileiro sobre este tema. Retorne apenas a descrição:`;

    console.log('Generating image description with Grok...');
    const analysisResponse = await openai.chat.completions.create({
      model: "grok-3",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em fotojornalismo brasileiro."
        },
        {
          role: "user", 
          content: analysisPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    const imageDescription = analysisResponse.choices[0].message.content || "";
    console.log('Generated description:', imageDescription);
    
    // Now generate image with Gemini
    console.log('Generating PNG image with Gemini...');
    const { generateArticleImage } = await import('./server/services/gemini.js');
    const imageUrl = await generateArticleImage(imageDescription, article.hashtag, 'banner');
    
    console.log('Generated image URL:', imageUrl);
    
    // Update the article
    const updatedArticle = await storage.updateArticle(article.id, {
      bannerImageUrl: imageUrl,
      imageUrl: imageUrl
    });
    
    console.log('Article updated successfully:', updatedArticle ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSingleArticle().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});