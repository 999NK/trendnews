# TrendNews

O **TrendNews** e um site de noticias automatizado que transforma postagens em tempo real do Twitter/X em artigos jornalisticos prontos para publicacao.

## Sobre o projeto

A plataforma monitora assuntos em alta no X (com foco no Brasil), identifica hashtags relevantes e gera noticias automaticamente usando IA.  
O sistema tambem permite moderacao editorial, publicacao manual/automatica e acompanhamento por dashboard.

## Como funciona

1. O backend busca tendencias e hashtags do X em tempo real.
2. Os topicos sao salvos e organizados por prioridade.
3. A IA pesquisa contexto da hashtag e gera o artigo completo.
4. O sistema cria metadados SEO e imagens para o conteudo.
5. Os artigos entram em fluxo de revisao/publicacao no painel.
6. Um agendador executa a geracao automatica diariamente.

## Principais funcionalidades

- Coleta automatica de trends do Twitter/X.
- Geracao de artigos com IA a partir de hashtags em alta.
- Geracao de imagens para banner e conteudo.
- Workflow editorial (rascunho, revisao, aprovacao, publicacao).
- Dashboard com estatisticas, logs e configuracoes.
- Execucao manual ou automatizada por agendamento.

## Tecnologias utilizadas

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Banco de dados:** PostgreSQL com Drizzle ORM
- **Automacao:** node-cron
- **IA:** xAI (Grok) e Google Gemini

## Requisitos

- Node.js 18+ (recomendado Node 20+)
- NPM
- Banco de dados PostgreSQL

## Configuracao do ambiente

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` com base em `.env.example`.

3. Defina, no minimo, as variaveis:

- `DATABASE_URL`
- `TWITTER_BEARER_TOKEN` (opcional, mas recomendado para dados em tempo real)
- `XAI_API_KEY`

## Rodando localmente

```bash
npm run dev
```

Aplicacao disponivel em `http://localhost:5000`.

## Build e producao

```bash
npm run build
npm start
```

## Banco de dados

Para sincronizar schema/migracoes com o banco:

```bash
npm run db:push
```

## Estrutura resumida

- `client/`: interface web (dashboard e paginas de noticias)
- `server/`: API, servicos de automacao, integracoes com IA e Twitter/X
- `shared/`: schemas e tipos compartilhados

## Objetivo

Entregar um portal de noticias dinamico, capaz de publicar conteudo atualizado com base no que esta acontecendo em tempo real no Twitter/X, reduzindo o tempo entre tendencia e publicacao.

