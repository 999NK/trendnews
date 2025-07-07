import { storage } from "./storage";

export async function initializeDatabase() {
  try {
    // Initialize default settings
    await storage.setSetting("automation_enabled", "true");
    await storage.setSetting("run_time", "12:00");
    await storage.setSetting("frequency", "daily");
    await storage.setSetting("max_articles", "10");
    await storage.setSetting("article_length", "medium");
    await storage.setSetting("writing_style", "informative");
    await storage.setSetting("language", "pt");

    // Create sample articles if none exist
    const existingArticles = await storage.getArticles();
    if (existingArticles.length === 0) {
      await createSampleArticles();
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

async function createSampleArticles() {
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
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      imageUrl: null,
    }
  ];

  for (const article of sampleArticles) {
    await storage.createArticle(article);
  }
}