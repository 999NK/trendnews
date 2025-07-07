# TrendNews - Guia de Implementação

## Pré-requisitos

### Tecnologias Necessárias
- Node.js 18+ 
- PostgreSQL 14+
- Chave API do Grok AI (xAI)
- Git

### Conhecimentos Recomendados
- React + TypeScript
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Electron (para app desktop)

## Instalação Local

### 1. Configuração do Ambiente
```bash
# Clonar repositório
git clone <repo-url>
cd trenднews-system

# Instalar dependências
npm install

# Configurar banco de dados
npm run db:setup
```

### 2. Variáveis de Ambiente
```env
# API Keys
XAI_API_KEY=your_grok_ai_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trenднews

# Application
NODE_ENV=development
PORT=5000
```

### 3. Executar o Sistema
```bash
# Desenvolvimento
npm run dev

# Acesso
# Dashboard: http://localhost:5000
# Blog: http://localhost:5000/blog
```

## Configuração da API Grok AI

### 1. Obter Chave API
1. Acesse [console.x.ai](https://console.x.ai)
2. Crie uma conta ou faça login
3. Navegue para "API Keys"
4. Gere uma nova chave
5. Adicione à variável `XAI_API_KEY`

### 2. Configurar Créditos
- A API requer créditos para funcionar
- Compre créditos em console.x.ai
- Monitore uso no dashboard

## Estrutura do Banco de Dados

### Tabelas Principais
```sql
-- Artigos gerados
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  hashtag VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trending topics
CREATE TABLE trending_topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  post_count INTEGER DEFAULT 0,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Logs do sistema
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Fluxo de Geração de Artigos

### 1. Coleta de Trending Topics
```javascript
// Buscar tópicos em alta
const topics = await fetchTrendingTopics();

// Filtrar por relevância
const relevantTopics = topics.filter(topic => 
  topic.postCount > 1000 && 
  topic.name.includes('#')
);
```

### 2. Geração de Conteúdo
```javascript
// Configurar geração
const options = {
  hashtag: '#ExemploTopic',
  length: 'medium',
  style: 'informative',
  language: 'pt'
};

// Gerar artigo
const article = await generateArticle(options);
```

### 3. Publicação
```javascript
// Salvar no banco
const savedArticle = await storage.createArticle({
  title: article.title,
  content: article.content,
  excerpt: article.excerpt,
  hashtag: options.hashtag,
  status: 'published'
});
```

## Customização do Blog

### Tema TrendNews (Cores)
```css
/* Cores principais */
:root {
  --primary: hsl(0, 84%, 60%);    /* Vermelho */
  --secondary: hsl(0, 0%, 96%);   /* Branco */
  --accent: hsl(0, 72%, 51%);     /* Vermelho escuro */
}

/* Aplicação */
.trenднews-header {
  background: var(--secondary);
  border-bottom: 2px solid var(--primary);
}

.trenднews-button {
  background: var(--primary);
  color: white;
}
```

### URLs Amigáveis
```javascript
// Gerar slug do título
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Rota do artigo
app.get('/noticia/:slug', async (req, res) => {
  const article = await findArticleBySlug(req.params.slug);
  res.render('article', { article });
});
```

## Agendamento Automático

### Configuração do Cron
```javascript
// Executar diariamente às 12:00
cron.schedule('0 12 * * *', async () => {
  console.log('Iniciando geração automática...');
  
  try {
    // Buscar trending topics
    const topics = await fetchTrendingTopics();
    
    // Gerar artigos
    for (const topic of topics.slice(0, 5)) {
      await generateAndPublishArticle(topic);
    }
    
    console.log('Geração concluída com sucesso');
  } catch (error) {
    console.error('Erro na geração:', error);
  }
});
```

## Monitoramento e Logs

### Sistema de Logs
```javascript
// Configurar logging
const logger = {
  info: (message, source = 'system') => {
    console.log(`[INFO] ${source}: ${message}`);
    saveLog('info', message, source);
  },
  
  error: (message, source = 'system') => {
    console.error(`[ERROR] ${source}: ${message}`);
    saveLog('error', message, source);
  }
};

// Uso
logger.info('Artigo gerado com sucesso', 'grok-ai');
logger.error('Falha na conexão com API', 'twitter');
```

### Métricas Importantes
- Taxa de sucesso da geração
- Tempo médio de geração
- Uso de créditos da API
- Artigos publicados por dia

## Troubleshooting

### Problemas Comuns

#### 1. Erro de API Key
```
Error: Invalid API key
```
**Solução**: Verificar se `XAI_API_KEY` está configurada corretamente

#### 2. Sem Créditos
```
Error: Insufficient credits
```
**Solução**: Comprar créditos em console.x.ai

#### 3. Erro de Banco
```
Error: Connection refused
```
**Solução**: Verificar se PostgreSQL está rodando e `DATABASE_URL` está correta

#### 4. Geração Falha
```
Error: Failed to generate article
```
**Solução**: Verificar logs, créditos da API e conectividade

## Deployment

### Opções de Hospedagem
- **Replit**: Ideal para desenvolvimento
- **Heroku**: Fácil deploy com PostgreSQL
- **AWS**: Máxima flexibilidade
- **DigitalOcean**: Custo-benefício

### Variáveis de Produção
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
XAI_API_KEY=...
PORT=5000
```

### Processo de Deploy
1. Configurar banco de dados
2. Definir variáveis de ambiente
3. Executar migrações
4. Iniciar aplicação
5. Configurar domínio
6. Monitorar logs