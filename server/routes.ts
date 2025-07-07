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
      res.status(500).json({ message: "Failed to fetch published articles" });
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
        status: 'published'
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
