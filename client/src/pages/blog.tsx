import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Calendar,
  User,
  Share2,
  ChevronRight,
  Twitter,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Menu,
  X,
  Info,
  Mail,
  Globe,
  TrendingUp,
  Star,
  Users,
  Target,
  Award,
  Home,
  BookOpen,
  Rss,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  hashtag: string;
  status: string;
  createdAt: string;
  publishedAt?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  contentImageUrl?: string;
  metaDescription?: string;
  seoKeywords?: string;
}

function generateGenericImage(hashtag: string): string {
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#dc2626;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#991b1b;stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <rect x="20" y="20" width="360" height="260" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="12"/>
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">TrendNews</text>
      <text x="50%" y="60%" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="12">${hashtag}</text>
      <circle cx="60" cy="60" r="20" fill="rgba(255,255,255,0.2)"/>
      <circle cx="340" cy="240" r="15" fill="rgba(255,255,255,0.3)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function shareOnTwitter(article: Article) {
  const baseUrl = window.location.origin;
  const articleUrl = `${baseUrl}/noticia/${article.id}`;
  const maxLength = 280 - articleUrl.length - 3;

  let tweetText = article.title;
  if (tweetText.length > maxLength) {
    tweetText = tweetText.substring(0, maxLength - 3) + "...";
  }

  const remaining = maxLength - tweetText.length;
  if (remaining > 10 && article.excerpt) {
    const excerptToAdd = article.excerpt.substring(0, remaining - 3) + "...";
    tweetText += " - " + excerptToAdd;
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(articleUrl)}`;
  window.open(twitterUrl, "_blank");
}

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/articles/published"],
  });

  const filteredArticles =
    articles?.filter(
      (article: Article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.hashtag.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1);

  const GoogleAdBanner = ({
    slotId,
    className = "",
    adFormat = "auto",
  }: {
    slotId: string;
    className?: string;
    adFormat?: string;
  }) => {
    return (
      <div
        className={`bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center ${className}`}
      >
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slotId}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        ></ins>
        <script
          dangerouslySetInnerHTML={{
            __html: `(adsbygoogle = window.adsbygoogle || []).push({});`,
          }}
        />
        <div className="text-center p-4 text-gray-500 text-sm">Publicidade</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      {/* Top Ad Banner */}
      <div className="bg-white sticky top-0 z-50 w-full">
        <GoogleAdBanner
          slotId="top_banner"
          className="w-full h-[90px] md:h-[100px]"
          adFormat="horizontal"
        />
      </div>

      {/* Main Layout */}
      <div className="flex w-full">
        {/* Left Sidebar Ad - Fixed */}
        <div className="hidden lg:block fixed left-0 top-[90px] md:top-[100px] bottom-0 w-[160px] xl:w-[200px] z-40">
          <GoogleAdBanner
            slotId="left_sidebar"
            className="w-full h-full"
            adFormat="vertical"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:ml-[160px] xl:ml-[200px] lg:mr-[160px] xl:mr-[200px]">
          {/* Header */}
          <header className="bg-white shadow-lg border-b border-red-100 sticky top-[90px] md:top-[100px] z-40">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/blog" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                      TrendNews
                    </h1>
                    <p className="text-xs text-gray-500 -mt-1">
                      Notícias em Tempo Real
                    </p>
                  </div>
                </Link>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/blog"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center space-x-1"
                >
                  <Home className="w-4 h-4" />
                  <span>Início</span>
                </Link>
                <button
                  onClick={() => setShowAbout(true)}
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center space-x-1"
                >
                  <Info className="w-4 h-4" />
                  <span>Sobre</span>
                </button>
                <a
                  href="https://x.com/tthunter999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors flex items-center space-x-1"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Seguir @tthunter999</span>
                </a>
              </nav>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-4">
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/blog"
                    className="text-gray-700 hover:text-red-600 font-medium px-2 py-1 flex items-center space-x-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Início</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowAbout(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-red-600 font-medium px-2 py-1 flex items-center space-x-2 text-left"
                  >
                    <Info className="w-4 h-4" />
                    <span>Sobre</span>
                  </button>
                  <a
                    href="https://x.com/tthunter999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-red-600 font-medium px-2 py-1 flex items-center space-x-2"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Seguir @tthunter999</span>
                  </a>
                </div>
              </div>
            )}
          </header>

          {/* Hero Section */}
          <section className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Últimas Notícias
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto">
                Mantenha-se informado com as notícias mais relevantes e
                atualizadas do Brasil e do mundo.
              </p>

              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Pesquisar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/40 rounded-full"
                />
              </div>
            </div>
          </section>

          {/* Mid Content Ad */}
          <div className="my-4">
            <GoogleAdBanner
              slotId="mid_content"
              className="w-full h-[90px]"
              adFormat="horizontal"
            />
          </div>

          {/* Main Content */}
          <div className="py-8">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card
                    key={i}
                    className="animate-pulse border-0 shadow-lg bg-white"
                  >
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
              <Card className="bg-white border border-gray-200 shadow-lg">
                <CardContent className="p-16 text-center">
                  <Search className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Nenhuma notícia encontrada
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {searchTerm
                      ? "Nenhuma notícia corresponde à sua pesquisa."
                      : "Ainda não temos notícias publicadas."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-12">
                {featuredArticle && (
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <Star className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-3xl font-bold text-gray-900">
                          Destaque
                        </h2>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800 border-red-200"
                      >
                        Artigo Principal
                      </Badge>
                    </div>

                    <Card className="overflow-hidden bg-white shadow-2xl border-0 rounded-2xl">
                      <div className="lg:flex">
                        <div className="lg:w-1/2">
                          <div className="h-80 lg:h-full relative overflow-hidden">
                            <img
                              src={
                                featuredArticle.imageUrl ||
                                featuredArticle.bannerImageUrl ||
                                generateGenericImage(featuredArticle.hashtag)
                              }
                              alt={featuredArticle.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = generateGenericImage(
                                  featuredArticle.hashtag,
                                );
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <Badge className="absolute top-4 left-4 bg-red-600 hover:bg-red-700">
                              {featuredArticle.hashtag}
                            </Badge>
                          </div>
                        </div>
                        <div className="lg:w-1/2 p-8 lg:p-12">
                          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {featuredArticle.title}
                          </h3>
                          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                            {featuredArticle.excerpt}
                          </p>

                          <div className="flex items-center justify-between mb-8 text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>tthunter999</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(featuredArticle.createdAt),
                                    {
                                      addSuffix: true,
                                      locale: ptBR,
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>5 min leitura</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Link href={`/noticia/${featuredArticle.id}`}>
                              <Button
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 text-white px-8"
                              >
                                Ler Matéria Completa
                                <ChevronRight className="w-5 h-5 ml-2" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => shareOnTwitter(featuredArticle)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Twitter className="w-4 h-4 mr-2" />
                              Compartilhar
                            </Button>
                            <Button
                              variant="ghost"
                              size="lg"
                              className="text-gray-600 hover:text-blue-600"
                            >
                              <Bookmark className="w-4 h-4 mr-2" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </section>
                )}

                {otherArticles.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <Rss className="w-6 h-6 text-red-600" />
                        <h2 className="text-3xl font-bold text-gray-900">
                          Últimas Notícias
                        </h2>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-red-200 text-red-700"
                      >
                        {otherArticles.length} artigos
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {otherArticles.map((article) => (
                        <Card
                          key={article.id}
                          className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border-0 rounded-xl group"
                        >
                          <Link
                            href={`/noticia/${article.id}`}
                            className="block"
                          >
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={
                                  article.imageUrl ||
                                  article.bannerImageUrl ||
                                  generateGenericImage(article.hashtag)
                                }
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  e.currentTarget.src = generateGenericImage(
                                    article.hashtag,
                                  );
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                              <Badge className="absolute top-3 left-3 bg-red-600/90 hover:bg-red-700 text-xs">
                                {article.hashtag}
                              </Badge>
                            </div>

                            <CardContent className="p-6">
                              <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                                {article.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                {article.excerpt}
                              </p>

                              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>tthunter999</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {formatDistanceToNow(
                                        new Date(article.createdAt),
                                        {
                                          addSuffix: true,
                                          locale: ptBR,
                                        },
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>3 min</span>
                                </div>
                              </div>

                              <Separator className="mb-4" />

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-gray-400">
                                  <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                                    <Heart className="w-4 h-4" />
                                    <span className="text-xs">12</span>
                                  </button>
                                  <button className="flex items-center space-x-1 hover:text-red-600 transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs">3</span>
                                  </button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    shareOnTwitter(article);
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-1"
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {filteredArticles.length > 7 && (
                  <div className="text-center mt-12">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-red-200 text-red-600 hover:bg-red-50 px-8"
                    >
                      Carregar Mais Notícias
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Ad Banner */}
            <div className="mt-12">
              <GoogleAdBanner
                slotId="bottom_banner"
                className="w-full h-[250px]"
                adFormat="horizontal"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar Ad - Fixed */}
        <div className="hidden lg:block fixed right-0 top-[90px] md:top-[100px] bottom-0 w-[160px] xl:w-[200px] z-40">
          <GoogleAdBanner
            slotId="right_sidebar"
            className="w-full h-full"
            adFormat="vertical"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">TrendNews</h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                Portal de notícias que mantém você informado sobre os assuntos
                mais relevantes e tendências do Brasil e do mundo.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://x.com/tthunter999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium transition-colors flex items-center space-x-2"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Seguir @tthunter999</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Categorias
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Política
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Economia
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Tecnologia
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Cultura
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Esportes
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Internacional
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">
                Links Úteis
              </h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowAbout(true)}
                    className="hover:text-white transition-colors text-left"
                  >
                    Sobre Nós
                  </button>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Contato
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Política de Privacidade
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Termos de Uso
                </li>
              </ul>
            </div>
          </div>

          <Separator className="bg-gray-700 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2025 TrendNews. Todos os direitos reservados.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-sm">Desenvolvido por tthunter999</span>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Sobre o TrendNews
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAbout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-red-600" />
                    <span>Nossa Missão</span>
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    O TrendNews é um portal de notícias dedicado a manter você
                    informado sobre os assuntos mais relevantes e tendências do
                    Brasil e do mundo. Nosso compromisso é com a qualidade,
                    veracidade e atualização constante das informações.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center space-x-2">
                    <Users className="w-5 h-5 text-red-600" />
                    <span>Nossa Equipe</span>
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Somos uma equipe de jornalistas e especialistas em
                    comunicação, liderada por
                    <strong> tthunter999</strong>, focada em trazer conteúdo de
                    qualidade e relevante para nossos leitores.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">tthunter999</p>
                        <p className="text-sm text-gray-600">Editor-chefe</p>
                      </div>
                      <a
                        href="https://x.com/tthunter999"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto bg-black text-white px-4 py-1 rounded-full text-sm hover:bg-gray-800 transition-colors flex items-center space-x-1"
                      >
                        <Twitter className="w-4 h-4" />
                        <span>Seguir</span>
                      </a>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-red-600" />
                    <span>Nossos Valores</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Transparência</p>
                        <p className="text-sm text-gray-600">
                          Informação clara e verificada
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Qualidade</p>
                        <p className="text-sm text-gray-600">
                          Conteúdo relevante e bem apurado
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Agilidade</p>
                        <p className="text-sm text-gray-600">
                          Notícias em tempo real
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Imparcialidade</p>
                        <p className="text-sm text-gray-600">
                          Cobertura equilibrada dos fatos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Siga-nos nas redes sociais para não perder nenhuma novidade!
                  </p>
                  <a
                    href="https://x.com/tthunter999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Seguir @tthunter999</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
