import { 
  Article, 
  InsertArticle, 
  TrendingTopic, 
  InsertTrendingTopic,
  SystemLog,
  InsertSystemLog,
  Settings,
  InsertSettings
} from "@shared/schema";

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
      }
    ];

    for (const article of sampleArticles) {
      const now = new Date();
      const newArticle: Article = {
        ...article,
        id: this.currentArticleId++,
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

export const storage = new MemStorage();
