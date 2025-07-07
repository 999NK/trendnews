# TrendNews - Arquitetura do Sistema

## Visão Geral

O TrendNews é um sistema híbrido de geração automatizada de notícias que combina:
- **Aplicativo Desktop**: Interface administrativa para geração de artigos
- **Blog Web Público**: Site público para visualização das notícias

## Arquitetura Atual (Monolito)

### Tecnologias Base
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **IA**: Grok AI (xAI) para geração de conteúdo
- **Styling**: Tailwind CSS + shadcn/ui

### Estrutura de Arquivos
```
├── client/          # Frontend (React)
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── lib/         # Utilitários e configurações
│   │   └── hooks/       # Hooks customizados
├── server/          # Backend (Node.js)
│   ├── services/    # Serviços (Grok AI, Twitter, etc.)
│   ├── index.ts     # Servidor principal
│   ├── routes.ts    # Rotas da API
│   └── storage.ts   # Camada de dados
├── shared/          # Esquemas compartilhados
│   └── schema.ts    # Definições Drizzle
└── docs/            # Documentação
```

## Arquitetura Alvo (Separação)

### 1. Aplicativo Desktop (Electron)
**Propósito**: Interface administrativa para geração de artigos
**Usuários**: Administradores do sistema
**Funcionalidades**:
- Dashboard com métricas
- Gerenciamento de artigos
- Configuração de geração automática
- Controle de publicação

### 2. Blog Web Público
**Propósito**: Site público para visualização das notícias
**Usuários**: Público geral
**Funcionalidades**:
- Listagem de notícias
- Visualização de artigos individuais
- Busca por conteúdo
- URLs amigáveis (trenднews.com.br/titulo-da-noticia)

### 3. API Backend Compartilhada
**Propósito**: Serviços centralizados
**Funcionalidades**:
- Geração de artigos via Grok AI
- Gerenciamento de banco de dados
- Autenticação e autorização
- Agendamento automático

## Separação Proposta

### Estrutura de Repositórios
```
trenднews-system/
├── desktop-app/     # Aplicativo Electron
├── public-blog/     # Blog web público
├── shared-api/      # API backend
└── shared-types/    # Tipos compartilhados
```

### Comunicação Entre Componentes
- **Desktop → API**: Chamadas HTTP para gerenciar artigos
- **Blog → API**: Chamadas HTTP para buscar artigos publicados
- **API → Grok AI**: Geração de conteúdo
- **API → PostgreSQL**: Persistência de dados

## Configuração de Domínios

### Domínios Sugeridos
- **Blog Público**: `trenднews.com.br`
- **Dashboard Admin**: `admin.trenднews.com.br`
- **API**: `api.trenднews.com.br`

### URLs de Artigos
- **Formato**: `trenднews.com.br/titulo-da-noticia`
- **Geração**: Slug baseado no título do artigo
- **Redirecionamento**: URLs antigas → novas URLs

## Migração Step-by-Step

### Fase 1: Separação de Rotas
1. Criar middleware de autenticação
2. Separar rotas públicas das administrativas
3. Implementar diferentes layouts

### Fase 2: Aplicativo Desktop
1. Configurar Electron
2. Migrar componentes administrativos
3. Implementar comunicação com API

### Fase 3: Blog Público
1. Criar tema TrendNews
2. Implementar SEO otimizado
3. Configurar URLs amigáveis

### Fase 4: Deployment
1. Configurar domínios
2. Implementar CI/CD
3. Monitoramento e logs

## Considerações Técnicas

### Vantagens da Separação
- **Segurança**: Isolamento entre admin e público
- **Performance**: Otimização específica para cada uso
- **Escalabilidade**: Componentes independentes
- **Manutenção**: Código mais organizado

### Desafios
- **Complexidade**: Múltiplos deployments
- **Sincronização**: Estado compartilhado
- **Desenvolvimento**: Configuração inicial

## Próximos Passos
1. Implementar autenticação no monolito atual
2. Criar branch para separação
3. Desenvolver aplicativo Electron
4. Otimizar blog público
5. Configurar infraestrutura de produção