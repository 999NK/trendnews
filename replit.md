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
- July 08, 2025. Blog redesenhado com layout profissional e funcionalidades avançadas
  - ✅ Redesign completo da página do blog com layout moderno e profissional
  - ✅ Header responsivo com navegação e menu mobile
  - ✅ Hero section com busca integrada e gradientes atraentes
  - ✅ Artigo em destaque com layout diferenciado
  - ✅ Grid de artigos com hover effects e animações suaves
  - ✅ Modal "Sobre" com informações detalhadas do blog
  - ✅ Botão de seguir @tthunter999 no Twitter integrado no header e footer
  - ✅ Funcionalidade de compartilhamento no Twitter com preenchimento automático de caracteres
  - ✅ Remoção de todas as referências de IA das páginas públicas
  - ✅ Mudança de autor de "Grok AI" para "tthunter999" em todos os artigos
  - ✅ Footer profissional com informações completas e links úteis
  - ✅ Sistema de badges e indicadores visuais para categorização
  - ✅ Botões funcionais para curtir, comentar e salvar artigos
  - ✅ Layout responsivo otimizado para mobile e desktop
- July 08, 2025. Sistema de imagens fotorrealistas implementado com sucesso
  - ✅ Migração de SVGs simples para URLs de imagens fotorrealistas reais
  - ✅ Integração com Unsplash e Picsum Photos para imagens de qualidade profissional
  - ✅ Análise contextual inteligente baseada na descrição do Grok AI
  - ✅ Categorização automática por tema (cultura, política, economia, tecnologia, etc.)
  - ✅ Geração de seeds consistentes baseadas na hashtag para imagens reproducíveis
  - ✅ URLs de imagens acessíveis: banner (800x400) e conteúdo (400x400)
  - ✅ Sistema testado: gera imagens reais em vez de layouts de texto simples
  - ✅ Correção do problema de "imagens com texto" que apareciam anteriormente
- July 08, 2025. Sistema de geração de imagens profissionais implementado e testado
  - ✅ Imagens agora são geradas após o artigo estar completo, usando o conteúdo real como base
  - ✅ Análise contextual do artigo via Grok AI para criar descrições específicas de fotos genéricas
  - ✅ Categorização automática por tema (política, economia, tecnologia, saúde, etc.)
  - ✅ Descrições focadas em ambientes e pessoas brasileiras adequadas para jornalismo
  - ✅ Sistema testado com sucesso - gera descrições detalhadas e contextuais
  - ✅ Fluxo: Artigo completo → Análise Grok → Descrição contextual → Imagem Gemini PNG
  - ✅ Mantido sistema de fallback para garantir disponibilidade das imagens
- July 08, 2025. Prompt de geração de imagem atualizado
  - Modificado prompt do Gemini para gerar descrições contextualizadas em vez de SVG
  - Sistema agora gera imagens PNG baseadas na descrição do tema do artigo
  - Cores e elementos visuais adaptativos baseados no conteúdo (política, economia, tecnologia)
  - Imagens profissionais com marca TrendNews e elementos temáticos brasileiros
  - Corrigidos problemas de parsing de SVG que causavam erros no Sharp
- July 07, 2025. Migration from Replit Agent to Replit environment completed
  - Fixed database connection and table creation with PostgreSQL
  - Resolved API key mapping (XAI, Twitter, Gemini) with proper environment variables
  - Fixed database field mapping between snake_case (database) and camelCase (frontend)
  - Corrected image generation service with proper PNG file creation and serving
  - All images now properly display in blog articles and detail pages
  - Successfully tested article generation, image creation, and blog functionality
  - Application running stable on port 5000 with full functionality restored
- July 07, 2025. Gemini AI + Sharp PNG image generation implemented
  - Gemini generates contextual SVG designs based on article content and themes
  - Sharp converts SVG to high-quality PNG images with precise dimensions
  - Context-aware designs with gradients, typography, and TrendNews branding  
  - Images saved as PNG files locally and served via Express static route (/images/)
  - Professional news-style layouts matching article topics (economia, política, tecnologia)
  - System generates both banner (800x400) and content (400x400) images
  - Replaced Puppeteer due to system dependencies issues in Replit environment
  - Fallback system maintained for API failures
- July 07, 2025. Real image URLs implemented for article generation
  - Replaced SVG data URLs with actual JPEG/PNG image URLs from Picsum Photos and Placeholder.com
  - Fixed "None" image display issues with reliable online image sources
  - Implemented consistent image generation based on article content and hashtags
  - All images now load properly as actual web-accessible image files
  - Enhanced fallback system with multiple image service providers
- July 07, 2025. Performance and UX improvements implemented
  - Fixed image generation with proper Gemini API fallbacks and error handling
  - Optimized article generation speed by reducing API tokens based on article length
  - Added article deletion functionality with confirmation dialog
  - Clarified article status workflow: draft → under_review → approved → published
  - Enhanced error handling for all image generation services
  - Improved article generation performance for short/medium articles
- July 07, 2025. Migrated from Replit Agent to Replit environment
  - Fixed database connection and schema creation with PostgreSQL
  - Optimized API token limits and response times for better performance
  - Improved error handling with fallback article generation
  - Enhanced API rate limiting and Twitter API error handling
  - System now runs reliably in Replit environment with proper workflow management
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
- July 07, 2025. Database migration completed
  - Migrated from in-memory storage to PostgreSQL database
  - Implemented full database schema with Drizzle ORM
  - Added database initialization with sample articles
  - Successfully connected to Replit PostgreSQL environment
- July 07, 2025. Professional blog standards implemented
  - Updated Grok AI prompts with professional blog rules
  - Enforced clean titles without hashtags
  - Structured HTML with proper hierarchy (H1, H2, H3)
  - Added engaging introductions and call-to-action endings
  - Implemented data-driven content with Brazilian examples
  - Real trending topics integration (#CongressoDaMamata, etc.)
- July 07, 2025. Article approval workflow and enhanced blog UX implemented
  - Added complete article approval system (draft → under_review → approved → published)
  - Manual article generation with review process (no automatic publishing)
  - Enhanced Grok AI prompts for more complete, professional articles (2500-3500 words)
  - Improved blog design with professional news site layout
  - Fixed image generation with Gemini AI fallback to generic SVG images
  - Removed all AI mentions from public blog (TrendNews branding)
  - Added comprehensive status management and editorial workflow
- July 07, 2025. API key management and error handling improvements
  - Fixed API key management with proper environment variable usage
  - Added comprehensive error handling for trending topics and article generation
  - Created .env.example file for secure API key configuration
  - Implemented fallback system for when external APIs fail
  - All API keys now properly configured: XAI_API_KEY, TWITTER_BEARER_TOKEN, GEMINI_API_KEY
- July 07, 2025. Enhanced humanized article generation
  - Updated Grok AI prompts for more humanized and complete articles
  - Enforced substantial content in each section (minimum 3-4 paragraphs)
  - Added storytelling elements, real examples, and testimonials
  - Improved narrative flow and conversational but professional tone
  - Removed robotic language in favor of natural, engaging writing
  - Each article section now has robust, deep content instead of superficial coverage

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