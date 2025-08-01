import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Hash, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useEffect } from "react";

export default function ArticleView() {
  const { id } = useParams();
  const articleId = id ? parseInt(id) : undefined;

  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !!articleId,
  });

  useEffect(() => {
    if (window?.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {}
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Header title="Article" />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Header title="Article Not Found" />
          <div className="p-6">
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-semibold text-secondary mb-2">
                  Article Not Found
                </h3>
                <p className="text-gray-500 mb-4">
                  The article you're looking for doesn't exist.
                </p>
                <Link href="/articles">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Articles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background relative">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <Header title="Article" />

        {/* Google Ads - Lateral Esquerda */}
        <div className="hidden lg:block fixed left-2 top-24 z-10">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "160px", height: "600px" }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="1111111111"
            data-ad-format="vertical"
            data-full-width-responsive="true"
          />
        </div>

        {/* Google Ads - Lateral Direita */}
        <div className="hidden lg:block fixed right-2 top-24 z-10">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "160px", height: "600px" }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="2222222222"
            data-ad-format="vertical"
            data-full-width-responsive="true"
          />
        </div>

        <div className="p-6 overflow-y-auto h-full">
          <div className="mb-6">
            <Link href="/articles">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Button>
            </Link>
          </div>

          <Card className="bg-surface shadow-sm">
            <CardHeader className="pb-4">
              {/* Google Ads - Topo do Artigo */}
              <div className="mb-4 w-full text-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", height: "90px" }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                  data-ad-slot="3333333333"
                  data-ad-format="horizontal"
                  data-full-width-responsive="true"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-xs">
                    <Hash className="w-3 h-3 mr-1" />
                    {article.hashtag}
                  </Badge>
                  <Badge
                    variant={
                      article.status === "published" ? "default" : "secondary"
                    }
                    className={`status-badge ${
                      article.status === "published"
                        ? "status-success"
                        : article.status === "processing"
                          ? "status-warning"
                          : "status-error"
                    }`}
                  >
                    {article.status}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDistanceToNow(new Date(article.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-secondary leading-tight">
                {article.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-primary">
                <p className="text-lg text-gray-700 italic">
                  {article.excerpt}
                </p>
              </div>

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        Published {new Date(article.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      Por tthunter999
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Ads - Final do Artigo */}
              <div className="mt-8 w-full text-center">
                <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%", height: "90px" }}
                  data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                  data-ad-slot="4444444444"
                  data-ad-format="horizontal"
                  data-full-width-responsive="true"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
