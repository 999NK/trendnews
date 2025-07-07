import { 
  Article, 
  InsertArticle, 
  TrendingTopic, 
  InsertTrendingTopic,
  SystemLog,
  InsertSystemLog,
  Settings,
  InsertSettings,
  articles,
  trendingTopics,
  systemLogs,
  settings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  publishArticle(id: number): Promise<Article | undefined>;
  unpublishArticle(id: number): Promise<Article | undefined>;
  getPublishedArticles(): Promise<Article[]>;

  // Trending Topics
  getTrendingTopics(): Promise<TrendingTopic[]>;
  getTrendingTopic(id: number): Promise<TrendingTopic | undefined>;
  createTrendingTopic(topic: InsertTrendingTopic): Promise<TrendingTopic>;
  updateTrendingTopic(id: number, topic: Partial<InsertTrendingTopic>): Promise<TrendingTopic | undefined>;
  clearTrendingTopics(): Promise<void>;

  // System Logs
  getSystemLogs(limit?: number): Promise<SystemLog[]>;
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;

  // Settings
  getSettings(): Promise<Settings[]>;
  getSetting(key: string): Promise<Settings | undefined>;
  setSetting(key: string, value: string): Promise<Settings>;

  // Stats
  getStats(): Promise<{
    articlesGenerated: number;
    trendingTopicsCount: number;
    apiCalls: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article> = new Map();
  private trendingTopics: Map<number, TrendingTopic> = new Map();
  private systemLogs: Map<number, SystemLog> = new Map();
  private settings: Map<string, Settings> = new Map();
  private currentArticleId = 1;
  private currentTopicId = 1;
  private currentLogId = 1;
  private currentSettingId = 1;

  constructor() {
    // Initialize with some default settings
    this.setSetting("automation_enabled", "true");
    this.setSetting("run_time", "12:00");
    this.setSetting("frequency", "daily");
    this.setSetting("max_articles", "10");
    this.setSetting("article_length", "medium");
    this.setSetting("writing_style", "informative");
    this.setSetting("language", "pt");
    this.createSampleArticles();
  }

  private createSampleArticles() {
    // Create sample articles for demonstration
    const sampleArticles = [
      {
        title: "Inteligência Artificial Revoluciona o Mercado Brasileiro",
        content: `# Inteligência Artificial Revoluciona o Mercado Brasileiro

A inteligência artificial (IA) está transformando rapidamente o cenário empresarial brasileiro, com empresas de todos os setores adotando tecnologias inovadoras para melhorar eficiência e competitividade.

## Principais Desenvolvimentos

### Crescimento no Setor Financeiro
O setor financeiro lidera a adoção de IA no Brasil, com bancos implementando chatbots inteligentes, análise preditiva de crédito e detecção de fraudes em tempo real.

### Agricultura 4.0
O agronegócio brasileiro está utilizando IA para:
- Otimização de plantio e colheita
- Monitoramento de pragas e doenças
- Análise de dados climáticos

### Impacto no Mercado de Trabalho
Especialistas apontam que a IA criará novas oportunidades de emprego, especialmente em:
- Desenvolvimento de sistemas inteligentes
- Análise de dados
- Gestão de projetos de automação

## Desafios e Oportunidades

O Brasil enfrenta desafios importantes na implementação de IA, incluindo a necessidade de:
- Maior investimento em educação tecnológica
- Desenvolvimento de regulamentações adequadas
- Criação de infraestrutura digital robusta

## Perspectivas Futuras

Analistas preveem que o mercado brasileiro de IA crescerá 25% ao ano nos próximos cinco anos, posicionando o país como um importante player regional em tecnologia.`,
        excerpt: "A inteligência artificial está transformando o cenário empresarial brasileiro, com adoção crescente em setores como financeiro, agricultura e tecnologia.",
        hashtag: "#InteligênciaArtificial",
        status: "published",
        published: true,
        publishedAt: new Date(),
        imageUrl: null,
      },
      {
        title: "Sustentabilidade: Tendências Verdes Dominam 2025",
        content: `# Sustentabilidade: Tendências Verdes Dominam 2025

O ano de 2025 marca um ponto de virada na agenda de sustentabilidade global, com o Brasil assumindo papel de liderança em iniciativas ambientais inovadoras.

## Energias Renováveis em Expansão

### Solar e Eólica
- Crescimento de 40% na capacidade instalada
- Novos parques solares no Nordeste
- Investimentos de R$ 50 bilhões previstos

### Hidrogênio Verde
O Brasil emerge como potencial exportador mundial de hidrogênio verde, com projetos em:
- Ceará
- Bahia
- Rio Grande do Norte

## Economia Circular

### Iniciativas Empresariais
Grandes empresas brasileiras estão implementando:
- Programas de reciclagem avançada
- Redução de emissões de carbono
- Produtos com pegada zero

### Impacto Social
A transição sustentável está criando:
- 500 mil novos empregos verdes
- Capacitação profissional em tecnologias limpas
- Desenvolvimento de comunidades rurais

## Tecnologias Emergentes

### IoT Ambiental
Sensores inteligentes monitoram:
- Qualidade do ar em tempo real
- Níveis de poluição hídrica
- Biodiversidade em ecossistemas

### Blockchain Verde
Rastreabilidade sustentável através de:
- Certificação de origem de produtos
- Mercados de crédito de carbono
- Transparência na cadeia produtiva

## Desafios e Metas

O Brasil se compromete a:
- Neutralidade de carbono até 2050
- Redução de 50% no desmatamento
- Expansão de áreas de conservação`,
        excerpt: "2025 marca um ponto de virada na sustentabilidade global, com o Brasil liderando iniciativas em energias renováveis e economia circular.",
        hashtag: "#Sustentabilidade",
        status: "published",
        published: true,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        imageUrl: null,
        metaDescription: null,
        seoKeywords: null,
      },
      {
        title: "Revolução FinTech: Como as Startups Estão Mudando o Sistema Financeiro",
        content: `# Revolução FinTech: Como as Startups Estão Mudando o Sistema Financeiro

O ecossistema FinTech brasileiro continua em expansão acelerada, revolucionando a forma como brasileiros lidam com dinheiro e investimentos.`,
        excerpt: "O ecossistema FinTech brasileiro expande rapidamente, com mais de 1.200 empresas revolucionando pagamentos, crédito e investimentos.",
        hashtag: "#FinTech",
        status: "draft",
        published: false,
        publishedAt: null,
        imageUrl: null,
        metaDescription: null,
        seoKeywords: null,
      }
    ];

    for (const article of sampleArticles) {
      const now = new Date();
      const newArticle: Article = {
        ...article,
        id: this.currentArticleId++,
        metaDescription: article.metaDescription || null,
        seoKeywords: article.seoKeywords || null,
        createdAt: now,
        updatedAt: now,
      };
      this.articles.set(newArticle.id, newArticle);
    }
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const now = new Date();
    const newArticle: Article = {
      ...article,
      id: this.currentArticleId++,
      status: article.status || "published",
      published: article.published || false,
      imageUrl: article.imageUrl || null,
      metaDescription: article.metaDescription || null,
      seoKeywords: article.seoKeywords || null,
      publishedAt: article.publishedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    this.articles.set(newArticle.id, newArticle);
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const existing = this.articles.get(id);
    if (!existing) return undefined;

    const updated: Article = {
      ...existing,
      ...article,
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  async publishArticle(id: number): Promise<Article | undefined> {
    const existing = this.articles.get(id);
    if (!existing) return undefined;

    const updated: Article = {
      ...existing,
      published: true,
      publishedAt: new Date(),
      status: "published",
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async unpublishArticle(id: number): Promise<Article | undefined> {
    const existing = this.articles.get(id);
    if (!existing) return undefined;

    const updated: Article = {
      ...existing,
      published: false,
      publishedAt: null,
      status: "draft",
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async getPublishedArticles(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.published)
      .sort((a, b) => 
        new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
      );
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    return Array.from(this.trendingTopics.values()).sort((a, b) => a.rank - b.rank);
  }

  async getTrendingTopic(id: number): Promise<TrendingTopic | undefined> {
    return this.trendingTopics.get(id);
  }

  async createTrendingTopic(topic: InsertTrendingTopic): Promise<TrendingTopic> {
    const newTopic: TrendingTopic = {
      ...topic,
      id: this.currentTopicId++,
      status: topic.status || "queued",
      createdAt: new Date(),
    };
    this.trendingTopics.set(newTopic.id, newTopic);
    return newTopic;
  }

  async updateTrendingTopic(id: number, topic: Partial<InsertTrendingTopic>): Promise<TrendingTopic | undefined> {
    const existing = this.trendingTopics.get(id);
    if (!existing) return undefined;

    const updated: TrendingTopic = {
      ...existing,
      ...topic,
    };
    this.trendingTopics.set(id, updated);
    return updated;
  }

  async clearTrendingTopics(): Promise<void> {
    this.trendingTopics.clear();
  }

  async getSystemLogs(limit = 50): Promise<SystemLog[]> {
    const logs = Array.from(this.systemLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return logs.slice(0, limit);
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const newLog: SystemLog = {
      ...log,
      id: this.currentLogId++,
      details: log.details || null,
      createdAt: new Date(),
    };
    this.systemLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getSettings(): Promise<Settings[]> {
    return Array.from(this.settings.values());
  }

  async getSetting(key: string): Promise<Settings | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<Settings> {
    const existing = this.settings.get(key);
    if (existing) {
      const updated: Settings = {
        ...existing,
        value,
        updatedAt: new Date(),
      };
      this.settings.set(key, updated);
      return updated;
    } else {
      const newSetting: Settings = {
        id: this.currentSettingId++,
        key,
        value,
        updatedAt: new Date(),
      };
      this.settings.set(key, newSetting);
      return newSetting;
    }
  }

  async getStats(): Promise<{
    articlesGenerated: number;
    trendingTopicsCount: number;
    apiCalls: number;
    successRate: number;
  }> {
    const articles = await this.getArticles();
    const topics = await this.getTrendingTopics();
    const logs = await this.getSystemLogs();
    
    const publishedArticles = articles.filter(a => a.status === "published").length;
    const totalArticles = articles.length;
    const apiCallLogs = logs.filter(l => l.type === "info" && l.message.includes("API")).length;
    const successRate = totalArticles > 0 ? (publishedArticles / totalArticles) * 100 : 98.5;

    return {
      articlesGenerated: publishedArticles,
      trendingTopicsCount: topics.length,
      apiCalls: apiCallLogs,
      successRate: Math.round(successRate * 10) / 10,
    };
  }
}

export class DatabaseStorage implements IStorage {
  async getArticles(): Promise<Article[]> {
    const rawArticles = await db.select().from(articles).orderBy(desc(articles.createdAt));
    
    // Map snake_case to camelCase for frontend compatibility
    return rawArticles.map(article => ({
      ...article,
      bannerImageUrl: article.banner_image_url,
      contentImageUrl: article.content_image_url,
      imageUrl: article.image_url,
      publishedAt: article.published_at
    })) as Article[];
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    if (!article) return undefined;
    
    // Map snake_case to camelCase for frontend compatibility
    return {
      ...article,
      bannerImageUrl: article.banner_image_url,
      contentImageUrl: article.content_image_url,
      imageUrl: article.image_url,
      publishedAt: article.published_at
    } as Article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db
      .insert(articles)
      .values({
        ...article,
        status: article.status || "published",
        published: article.published || false,
        image_url: article.imageUrl || null,
        banner_image_url: article.bannerImageUrl || null,
        content_image_url: article.contentImageUrl || null,
        published_at: article.publishedAt || null,
      })
      .returning();
    
    // Map snake_case to camelCase for frontend compatibility
    return {
      ...newArticle,
      bannerImageUrl: newArticle.banner_image_url,
      contentImageUrl: newArticle.content_image_url,
      imageUrl: newArticle.image_url,
      publishedAt: newArticle.published_at
    } as Article;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const updateData: any = { ...article };
    
    // Map camelCase to snake_case for database
    if (article.imageUrl !== undefined) updateData.image_url = article.imageUrl;
    if (article.bannerImageUrl !== undefined) updateData.banner_image_url = article.bannerImageUrl;
    if (article.contentImageUrl !== undefined) updateData.content_image_url = article.contentImageUrl;
    if (article.publishedAt !== undefined) updateData.published_at = article.publishedAt;
    
    const [updated] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    // Map snake_case to camelCase for frontend compatibility
    return {
      ...updated,
      bannerImageUrl: updated.banner_image_url,
      contentImageUrl: updated.content_image_url,
      imageUrl: updated.image_url,
      publishedAt: updated.published_at
    } as Article;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return (result.rowCount || 0) > 0;
  }

  async publishArticle(id: number): Promise<Article | undefined> {
    const [updated] = await db
      .update(articles)
      .set({
        published: true,
        publishedAt: new Date(),
        status: "published",
      })
      .where(eq(articles.id, id))
      .returning();
    return updated || undefined;
  }

  async unpublishArticle(id: number): Promise<Article | undefined> {
    const [updated] = await db
      .update(articles)
      .set({
        published: false,
        publishedAt: null,
        status: "draft",
      })
      .where(eq(articles.id, id))
      .returning();
    return updated || undefined;
  }

  async getPublishedArticles(): Promise<Article[]> {
    const rawArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.publishedAt));
    
    // Map snake_case to camelCase for frontend compatibility
    return rawArticles.map(article => ({
      ...article,
      bannerImageUrl: article.banner_image_url,
      contentImageUrl: article.content_image_url,
      imageUrl: article.image_url,
      publishedAt: article.published_at
    })) as Article[];
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    return await db.select().from(trendingTopics).orderBy(trendingTopics.rank);
  }

  async getTrendingTopic(id: number): Promise<TrendingTopic | undefined> {
    const [topic] = await db.select().from(trendingTopics).where(eq(trendingTopics.id, id));
    return topic || undefined;
  }

  async createTrendingTopic(topic: InsertTrendingTopic): Promise<TrendingTopic> {
    const [newTopic] = await db
      .insert(trendingTopics)
      .values({
        ...topic,
        status: topic.status || "queued",
      })
      .returning();
    return newTopic;
  }

  async updateTrendingTopic(id: number, topic: Partial<InsertTrendingTopic>): Promise<TrendingTopic | undefined> {
    const [updated] = await db
      .update(trendingTopics)
      .set(topic)
      .where(eq(trendingTopics.id, id))
      .returning();
    return updated || undefined;
  }

  async clearTrendingTopics(): Promise<void> {
    await db.delete(trendingTopics);
  }

  async getSystemLogs(limit = 50): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit);
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [newLog] = await db
      .insert(systemLogs)
      .values({
        ...log,
        details: log.details || null,
      })
      .returning();
    return newLog;
  }

  async getSettings(): Promise<Settings[]> {
    return await db.select().from(settings);
  }

  async getSetting(key: string): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(key: string, value: string): Promise<Settings> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      const [newSetting] = await db
        .insert(settings)
        .values({ key, value })
        .returning();
      return newSetting;
    }
  }

  async getStats(): Promise<{
    articlesGenerated: number;
    trendingTopicsCount: number;
    apiCalls: number;
    successRate: number;
  }> {
    const [articleStats] = await db
      .select({
        total: sql<number>`count(*)`,
        published: sql<number>`count(*) filter (where published = true)`,
      })
      .from(articles);

    const [topicCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trendingTopics);

    const [apiCallCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(systemLogs)
      .where(sql`type = 'info' AND message LIKE '%API%'`);

    const successRate = articleStats.total > 0 ? (articleStats.published / articleStats.total) * 100 : 98.5;

    return {
      articlesGenerated: articleStats.published,
      trendingTopicsCount: topicCount.count,
      apiCalls: apiCallCount.count,
      successRate: Math.round(successRate * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();
