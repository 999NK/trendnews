import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TrendingTopics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: topics, isLoading } = useQuery({
    queryKey: ["/api/trending-topics"],
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/trending-topics/fetch"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trending-topics"] });
      toast({
        title: "Sucesso",
        description: "Trending topics atualizados com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar trending topics",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="bg-surface shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trendingTopics = topics || [];

  return (
    <Card className="bg-surface shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Trending Topics</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`mr-1 h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {trendingTopics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted" />
            <p>Nenhum trending topic encontrado</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              Buscar Topics
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {trendingTopics.map((topic) => (
              <div 
                key={topic.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{topic.rank}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{topic.hashtag}</h4>
                    <p className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
                  </div>
                </div>
                <Badge 
                  variant="secondary"
                  className={`status-badge ${
                    topic.status === "completed" ? "status-success" : 
                    topic.status === "processing" ? "status-warning" : 
                    topic.status === "failed" ? "status-error" :
                    "bg-gray-300 text-gray-700"
                  }`}
                >
                  {topic.status === "completed" ? "Artigo Criado" :
                   topic.status === "processing" ? "Processando" :
                   topic.status === "failed" ? "Falhou" :
                   "Na Fila"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
