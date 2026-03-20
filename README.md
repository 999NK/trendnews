# TrendNews

O **TrendNews** e um site de noticias automatizado que transforma postagens em tempo real do Twitter/X em artigos jornalisticos prontos para publicacao.

## Sobre o projeto

A plataforma monitora assuntos em alta no X (com foco no Brasil), identifica hashtags relevantes e gera noticias automaticamente usando IA.  
O sistema tambem permite moderacao editorial, publicacao manual/automatica e acompanhamento por dashboard.

</p>

<p align="center">
  <img src="https://i.ibb.co/mrMSSxDq/Captura-de-tela-2026-03-20-184659.png" alt="Imagem 6 do projeto" width="700" />
</p>

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


## Objetivo

Entregar um portal de noticias dinamico, capaz de publicar conteudo atualizado com base no que esta acontecendo em tempo real no Twitter/X, reduzindo o tempo entre tendencia e publicacao.

