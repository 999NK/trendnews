import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { fetchTrendingTopics, searchTweetsByHashtag } from "./services/twitter";
import { generateArticle, researchTopic } from "./services/grok";
import { runAutomatedGeneration, scheduleAutomatedRun, stopScheduledTask, initializeScheduler } from "./services/scheduler";
import { insertArticleSchema, insertSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize scheduler on startup
  await initializeScheduler();

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all articles
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/published", async (req, res) => {
    try {
      const articles = await storage.getPublishedArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching published articles:", error);
      res.status(500).json({ message: "Failed to fetch published articles", error: error.message });
    }
  });

  app.post("/api/articles/:id/publish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.publishArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article published successfully", article });
    } catch (error) {
      res.status(500).json({ message: "Failed to publish article" });
    }
  });

  app.post("/api/articles/:id/unpublish", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.unpublishArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article unpublished successfully", article });
    } catch (error) {
      res.status(500).json({ message: "Failed to unpublish article" });
    }
  });

  // Article approval workflow
  app.post("/api/articles/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.updateArticle(id, { status: 'approved' });
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article approved successfully", article });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve article" });
    }
  });

  app.post("/api/articles/:id/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.updateArticle(id, { status: 'rejected' });
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article rejected successfully", article });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject article" });
    }
  });

  app.post("/api/articles/:id/submit-for-review", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.updateArticle(id, { status: 'under_review' });
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article submitted for review successfully", article });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit article for review" });
    }
  });

  // Regenerate images for existing article
  app.post("/api/articles/:id/regenerate-images", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // Import the professional image generation function
      const { generateArticle } = await import("./services/grok");
      
      // Generate new professional images based on article content
      const generateProfessionalImage = async (articleContent: string, title: string, hashtag: string, type: 'banner' | 'content'): Promise<string> => {
        const { generateArticleImage } = await import("./services/grok");
        
        // Use the same analysis logic as in the main generation
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

        const { generateArticleImage: generateGeminiImage } = await import("./services/gemini");
        
        try {
          // Use Grok to analyze the article content
          const OpenAI = (await import("openai")).default;
          const openai = new OpenAI({
            baseURL: "https://api.x.ai/v1",
            apiKey: process.env.XAI_API_KEY,
          });

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
          
          // Generate image using Gemini with the contextual description
          return await generateGeminiImage(imageDescription, hashtag, type);
        } catch (error) {
          console.error("Error generating professional image:", error);
          // Fallback to generic image based on title
          const { generateArticleImage: generateFallbackImage } = await import("./services/imageGenerator");
          return generateFallbackImage(title, hashtag);
        }
      };

      // Generate new images
      const bannerImageUrl = await generateProfessionalImage(article.content, article.title, article.hashtag, 'banner');
      const contentImageUrl = await generateProfessionalImage(article.content, article.title, article.hashtag, 'content');
      
      // Update article with new images
      const updatedArticle = await storage.updateArticle(id, {
        bannerImageUrl,
        contentImageUrl,
        imageUrl: bannerImageUrl // For backward compatibility
      });
      
      res.json({ 
        message: "Images regenerated successfully", 
        article: updatedArticle,
        bannerImageUrl,
        contentImageUrl
      });
    } catch (error) {
      console.error("Error regenerating images:", error);
      res.status(500).json({ message: "Failed to regenerate images", error: error.message });
    }
  });

  // Get single article
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      

      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Create new article
  app.post("/api/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Delete article
  app.delete("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteArticle(id);
      if (!deleted) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Get trending topics
  app.get("/api/trending-topics", async (req, res) => {
    try {
      const topics = await storage.getTrendingTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Fetch fresh trending topics from Twitter
  app.post("/api/trending-topics/fetch", async (req, res) => {
    try {
      const trends = await fetchTrendingTopics();
      
      // Clear existing and add new ones
      await storage.clearTrendingTopics();
      
      for (const trend of trends) {
        await storage.createTrendingTopic({
          hashtag: trend.hashtag,
          posts: trend.posts,
          rank: trend.rank,
          status: 'queued'
        });
      }

      await storage.createSystemLog({
        message: `Fetched ${trends.length} trending topics from X API`,
        type: 'info',
        details: { count: trends.length }
      });

      res.json({ message: "Trending topics updated successfully", count: trends.length });
    } catch (error) {
      await storage.createSystemLog({
        message: `Failed to fetch trending topics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      res.status(500).json({ message: "Failed to fetch trending topics" });
    }
  });

  // Generate article manually
  app.post("/api/generate-article", async (req, res) => {
    try {
      const { hashtag, length = 'medium', style = 'informative', language = 'pt' } = req.body;

      if (!hashtag) {
        return res.status(400).json({ message: "Hashtag is required" });
      }

      const article = await generateArticle({
        hashtag,
        length,
        style,
        language
      });

      const savedArticle = await storage.createArticle({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        hashtag,
        status: 'draft',
        imageUrl: article.imageUrl,
        bannerImageUrl: article.bannerImageUrl,
        contentImageUrl: article.contentImageUrl,
        metaDescription: article.metaDescription,
        seoKeywords: article.seoKeywords
      });

      await storage.createSystemLog({
        message: `Manually generated article for ${hashtag}`,
        type: 'success',
        details: { hashtag, title: article.title }
      });

      res.json(savedArticle);
    } catch (error) {
      await storage.createSystemLog({
        message: `Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      res.status(500).json({ message: "Failed to generate article" });
    }
  });

  // Run manual generation for all trending topics
  app.post("/api/generate-all", async (req, res) => {
    try {
      // Start automated generation process
      runAutomatedGeneration().catch(error => {
        console.error("Error in automated generation:", error);
      });

      res.json({ message: "Article generation started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start article generation" });
    }
  });

  // Generate articles from selected hashtags
  app.post("/api/generate-selected", async (req, res) => {
    try {
      const { hashtags } = req.body;
      
      if (!hashtags || !Array.isArray(hashtags) || hashtags.length === 0) {
        return res.status(400).json({ message: "Please provide an array of hashtags" });
      }

      // Generate articles for selected hashtags
      const results = [];
      
      for (const hashtag of hashtags) {
        try {
          const article = await generateArticle({
            hashtag: hashtag,
            length: 'medium',
            style: 'engaging',
            language: 'pt'
          });

          const createdArticle = await storage.createArticle({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            hashtag: hashtag,
            status: 'draft', // Changed to draft for manual approval
            imageUrl: article.imageUrl,
            bannerImageUrl: article.bannerImageUrl,
            contentImageUrl: article.contentImageUrl,
            metaDescription: article.metaDescription,
            seoKeywords: article.seoKeywords,
            published: false,
            publishedAt: null,
          });

          results.push(createdArticle);

          await storage.createSystemLog({
            message: `Successfully generated article for ${hashtag}`,
            type: 'success',
            details: { hashtag: hashtag, title: article.title }
          });

        } catch (error) {
          await storage.createSystemLog({
            message: `Failed to generate article for ${hashtag}`,
            type: 'error',
            details: { hashtag: hashtag, error: error.message }
          });
        }
      }

      res.json({ 
        message: `Generated ${results.length} articles successfully`,
        articles: results
      });

    } catch (error) {
      res.status(500).json({ message: "Failed to generate articles" });
    }
  });

  // Get system logs
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getSystemLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.post("/api/settings", async (req, res) => {
    try {
      const settingsData = req.body;
      const updatedSettings = [];

      for (const [key, value] of Object.entries(settingsData)) {
        if (typeof value === 'string') {
          const setting = await storage.setSetting(key, value);
          updatedSettings.push(setting);
        }
      }

      // Restart scheduler if automation settings changed
      if (settingsData.automation_enabled !== undefined || settingsData.run_time !== undefined) {
        await stopScheduledTask();
        if (settingsData.automation_enabled === 'true') {
          await scheduleAutomatedRun(settingsData.run_time || '12:00');
        }
      }

      await storage.createSystemLog({
        message: 'Settings updated successfully',
        type: 'success',
        details: { updatedKeys: Object.keys(settingsData) }
      });

      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Research topic endpoint
  app.post("/api/research-topic", async (req, res) => {
    try {
      const { hashtag } = req.body;
      if (!hashtag) {
        return res.status(400).json({ message: "Hashtag is required" });
      }

      const research = await researchTopic(hashtag);
      res.json({ research });
    } catch (error) {
      res.status(500).json({ message: "Failed to research topic" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
