import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Share2, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Generate generic SVG for blog previews
function generateGenericImage(hashtag: string): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#dc2626;stop-opacity:0.2" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="20" y="20" width="360" height="260" fill="none" stroke="#dc2626" stroke-width="2" rx="10"/>
      <text x="50%" y="40%" text-anchor="middle" fill="#dc2626" font-family="Arial, sans-serif" font-size="20" font-weight="bold">TrendNews</text>
      <text x="50%" y="60%" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">${hashtag}</text>
      <circle cx="340" cy="60" r="15" fill="#dc2626" opacity="0.7"/>
      <rect x="40" y="220" width="50" height="3" fill="#dc2626" rx="1"/>
      <rect x="40" y="230" width="30" height="3" fill="#dc2626" rx="1"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Função para criar slug da URL
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-')      // Substitui espaços por hífens
    .replace(/-+/g, '-')       // Remove hífens consecutivos
    .trim();
}

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/articles/published"],
  });

  const publishedArticles = articles || [];
  
  const filteredArticles = publishedArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1, 7);

  return (
    <div className="min-h-screen bg-white">
      {/* Header do Blog TrendNews */}
      <header className="bg-white border-b-2 border-red-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  TrendNews
                </h1>
                <p className="text-sm text-gray-600">
                  Notícias em tempo real sobre o Brasil
                </p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Início</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Política</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Economia</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Tecnologia</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breaking News Banner */}
        <div className="mb-8 bg-red-600 text-white px-6 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="bg-white text-red-600 px-2 py-1 rounded text-sm font-bold">ÚLTIMAS</span>
            <span className="text-sm font-medium">Acompanhe as principais notícias do Brasil em tempo real</span>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar notícias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-gray-200 focus:border-red-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Loading skeleton */}
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma notícia encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Nenhuma notícia corresponde à sua pesquisa." : "Ainda não temos notícias publicadas."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Artigo em Destaque */}
            {featuredArticle && (
              <section>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Artigo em Destaque
                </h2>
                <Card className="overflow-hidden bg-card">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <div className="h-64 md:h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={featuredArticle.imageUrl || featuredArticle.bannerImageUrl || generateGenericImage(featuredArticle.hashtag)} 
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Featured image failed to load:', e.currentTarget.src);
                            e.currentTarget.src = generateGenericImage(featuredArticle.hashtag);
                          }}
                        />
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8">
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDistanceToNow(new Date(featuredArticle.createdAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="w-4 h-4 mr-2" />
                          Redação TrendNews
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Link href={`/noticia/${featuredArticle.id}`}>
                          <Button size="lg" className="bg-red-600 hover:bg-red-700">
                            Ler Notícia Completa
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="lg">
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Grid de Artigos */}
            {otherArticles.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Últimos Artigos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherArticles.map((article) => (
                    <Card key={article.id} className="overflow-hidden bg-card hover:shadow-lg transition-shadow group cursor-pointer">
                      <Link href={`/noticia/${article.id}`} className="block">
                        <div className="h-48 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center relative overflow-hidden">
                          <img 
                            src={article.imageUrl || article.bannerImageUrl || generateGenericImage(article.hashtag)} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Article image failed to load:', e.currentTarget.src);
                              e.currentTarget.src = generateGenericImage(article.hashtag);
                            }}
                          />
                        </div>
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(new Date(article.createdAt), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </div>
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              Grok AI
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Navegação */}
        {filteredArticles.length > 7 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Carregar Mais Artigos
            </Button>
          </div>
        )}
      </div>

      {/* Footer do Blog */}
      <footer className="bg-muted dark:bg-card mt-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Sobre o TrendNews
              </h3>
              <p className="text-gray-600">
                Portal de notícias que utiliza inteligência artificial para gerar automaticamente 
                conteúdo sobre os assuntos mais comentados no Brasil. Mantemos você informado 
                com notícias de qualidade, sempre atualizadas e relevantes.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold text-foreground dark:text-white mb-4">
                Categorias
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Tecnologia</li>
                <li>Inteligência Artificial</li>
                <li>Inovação</li>
                <li>Sustentabilidade</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold text-foreground dark:text-white mb-4">
                Links
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="hover:text-primary transition-colors">
                    Gerenciar Artigos
                  </Link>
                </li>
                <li>Política de Privacidade</li>
                <li>Contato</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Grok AI News. Todos os direitos reservados. Powered by Grok AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}