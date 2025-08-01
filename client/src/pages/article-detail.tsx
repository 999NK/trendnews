import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Function to insert content image between 2nd and 3rd paragraphs
function processArticleContent(content: string, contentImageUrl?: string): string {
  if (!contentImageUrl) return content;

  const paragraphs = content.split('</p>');
  if (paragraphs.length >= 3) {
    const imageHtml = `
      <div class="my-8 text-center">
        <img src="${contentImageUrl}" alt="Imagem relacionada ao conteúdo" class="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg shadow-lg" onerror="console.warn('Erro ao carregar imagem:', this.src)" />
      </div>
    `;
    const beforeImage = paragraphs.slice(0, 2).join('</p>') + '</p>';
    const afterImage = paragraphs.slice(2).join('</p>');
    return beforeImage + imageHtml + afterImage;
  }

  return content;
}

export default function ArticleDetail() {
  const [location] = useLocation();
  const articleId = location.split("/")[2];

  const { data: article, isLoading } = useQuery({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !!articleId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artigo não encontrado</h1>
          <Link href="/blog">
            <Button className="bg-red-600 hover:bg-red-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const bannerUrl =
    article.bannerImageUrl ||
    article.banner_image_url ||
    article.imageUrl ||
    article.image_url ||
    null;

  const contentImageUrl =
    article.contentImageUrl ||
    article.content_image_url ||
    null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header do TrendNews */}
      <header className="bg-white border-b-2 border-red-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TrendNews</h1>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/blog" className="text-gray-900 hover:text-red-600 font-medium">Início</Link>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Política</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Economia</a>
              <a href="#" className="text-gray-900 hover:text-red-600 font-medium">Tecnologia</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Navegação */}
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-600 hover:text-red-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às notícias
            </Button>
          </Link>
        </div>

        {/* Artigo */}
        <article className="bg-white">
          <header className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {article.hashtag}
              </Badge>
              {article.status === "published" && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Publicado
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Banner Image */}
            {bannerUrl && (
              <div className="mb-8">
                <img
                  src={bannerUrl}
                  alt="Imagem de destaque do artigo"
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.warn("Erro ao carregar imagem:", target.src);
                  }}
                />
              </div>
            )}

            

            <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  TrendNews IA
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDistanceToNow(new Date(article.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </header>

          {/* Conteúdo do Artigo */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{
              __html: processArticleContent(article.content, contentImageUrl),
            }}
          />

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <p>Autor: tthunter999</p>
                <p>© {new Date().getFullYear()} TrendNews - Todos os direitos reservados</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    const articleUrl = window.location.href;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title + " - " + article.excerpt.substring(0, 100) + "...")}&url=${encodeURIComponent(articleUrl)}`;
                    window.open(twitterUrl, '_blank');
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Link href="/blog">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Ver mais notícias
                  </Button>
                </Link>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
