# Grok AI News - Automated Blog Generator

## Overview

This is a full-stack web application that automatically generates news articles from trending topics using Grok AI (X.ai). The system fetches trending hashtags from Twitter (or mock data), uses Grok AI to generate comprehensive articles, and presents them through a modern React-based dashboard.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Grok AI (X.ai) for article generation
- **Social Media**: Twitter API for trending topics
- **Scheduling**: Node-cron for automated article generation

### Key Technologies
- **Database ORM**: Drizzle with PostgreSQL dialect
- **Schema Validation**: Zod for type-safe data validation
- **Form Handling**: React Hook Form with resolvers
- **Date Utilities**: date-fns for date manipulation
- **Development**: TSX for TypeScript execution

## Key Components

### Database Schema
The application uses four main tables:
- `articles`: Stores generated articles with title, content, excerpt, hashtag, and status
- `trending_topics`: Tracks hashtags with post counts and processing status
- `system_logs`: Maintains application logs for monitoring
- `settings`: Configurable application settings

### API Endpoints
- `/api/stats` - Dashboard statistics
- `/api/articles` - Article CRUD operations
- `/api/trending-topics` - Trending hashtag management
- `/api/generate-all` - Trigger article generation
- `/api/settings` - Application configuration

### Core Services
- **Grok Service**: Handles AI-powered article generation with customizable length, style, and language
- **Twitter Service**: Fetches trending topics (with mock data fallback)
- **Scheduler Service**: Manages automated article generation with cron jobs
- **Storage Service**: Abstracts database operations with in-memory fallback

## Data Flow

1. **Trending Topics**: System fetches trending hashtags from Twitter API or uses mock data
2. **Article Generation**: Selected topics are processed through Grok AI to generate articles
3. **Content Storage**: Generated articles are stored in PostgreSQL database
4. **Dashboard Display**: React frontend displays articles, statistics, and trending topics
5. **Automated Scheduling**: Cron jobs can be configured to run article generation automatically

## External Dependencies

### AI Services
- **Grok AI (X.ai)**: Primary AI service for article generation
- API Key required via `XAI_API_KEY` environment variable

### Social Media APIs
- **Twitter API**: For fetching trending topics
- Bearer token required via `TWITTER_BEARER_TOKEN` environment variable
- Falls back to mock data when API key is not available

### Database
- **PostgreSQL**: Primary data storage via Neon serverless
- Connection string required via `DATABASE_URL` environment variable

## Deployment Strategy

### Development
- Uses Vite dev server with HMR for frontend
- TSX for running TypeScript server code
- Replit-specific plugins for development environment

### Production Build
- Vite builds optimized frontend bundle
- ESBuild compiles server code to single executable
- Static files served from Express server

### Environment Configuration
- Database migrations handled by Drizzle Kit
- Environment variables for API keys and database connection
- Graceful fallbacks for missing external services

## API Key Setup

### xAI Grok AI (Configured)
- **Status**: ✅ Configurado e funcionando
- **API Key**: XAI_API_KEY (presente)
- **Uso**: Geração de artigos em português
- **Creditos**: Necessários para usar a API - visite https://console.x.ai

### Twitter/X API (Limitado)
- **Status**: ⚠️ Limitado ao nível gratuito
- **Bearer Token**: TWITTER_BEARER_TOKEN (presente)
- **Limitações descobertas**:
  - Nível gratuito não suporta trending topics
  - Nível gratuito não suporta busca geográfica
  - Limite de rate muito baixo (429 - Too Many Requests)

### Solução Implementada
- **Sistema Inteligente Brasileiro**: Trending topics dinâmicos baseados em:
  - Horário do dia (manhã, tarde, noite)
  - Dia da semana (útil vs fim de semana)
  - Sazonalidade (verão, inverno, etc.)
  - Variação aleatória para simular dinâmica real

## Changelog

Changelog:
- July 07, 2025. Complete automated news generation system implemented
  - Grok AI integration for article generation
  - Twitter/X trending topics fetching (with mock fallback)
  - Automated scheduling system (daily at 12:00 PM)
  - Full React dashboard with article management
  - Portuguese language support as default
- July 07, 2025. TrendNews blog theme implemented
  - Professional white and red color scheme
  - Separate blog view with TrendNews branding
  - Article detail page with SEO-friendly URLs
  - Enhanced article generation with professional rules
  - Complete system documentation created
- July 07, 2025. Twitter API limitation resolution
  - Discovered Twitter API gratuita não suporta trending topics
  - Implementado sistema inteligente brasileiro de trending topics
  - Sistema dinâmico baseado em horário, dia da semana e sazonalidade
  - Sistema de fallback robusto para continuidade do serviço

## User Preferences

Preferred communication style: Simple, everyday language.

## Architecture Requirements

Future system architecture:
- Desktop application for article generation (Electron-based)
- Separate public blog website (TrendNews brand)
- Shared API backend for both applications
- Professional news blog appearance with white/red theme
- SEO-friendly URLs based on article titles
- Complete separation between admin dashboard and public blog