import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function RecentArticles() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <Card className="bg-surface shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Artigos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentArticles = articles?.slice(0, 5) || [];

  return (
    <Card className="bg-surface shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Artigos Recentes</CardTitle>
          <Link href="/articles" className="text-primary hover:text-blue-700 text-sm font-medium">
            Ver Todos
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {recentArticles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted" />
            <p>Nenhum artigo gerado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="block"
              >
                <div className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Newspaper className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{article.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                      </span>
                      <Badge 
                        variant={article.status === "published" ? "default" : "secondary"}
                        className={`status-badge ${
                          article.status === "published" ? "status-success" : 
                          article.status === "processing" ? "status-warning" : 
                          "status-error"
                        }`}
                      >
                        {article.status}
                      </Badge>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
