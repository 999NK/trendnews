import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, TrendingUp, Sparkles, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function TrendingTopics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

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

  const generateSelectedMutation = useMutation({
    mutationFn: (hashtags: string[]) => apiRequest("POST", "/api/generate-selected", { hashtags }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedTopics([]);
      toast({
        title: "Sucesso!",
        description: `${data.articles?.length || 0} artigos gerados com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Falha ao gerar artigos selecionados",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleTopicSelect = (hashtag: string) => {
    setSelectedTopics(prev => 
      prev.includes(hashtag) 
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const handleGenerateSelected = () => {
    if (selectedTopics.length === 0) {
      toast({
        title: "Seleção Vazia",
        description: "Selecione pelo menos um trending topic",
        variant: "destructive",
      });
      return;
    }
    generateSelectedMutation.mutate(selectedTopics);
  };

  const selectAll = () => {
    const availableTopics = (topics || [])
      .filter(topic => topic.status === "queued")
      .map(topic => topic.hashtag);
    setSelectedTopics(availableTopics);
  };

  const clearSelection = () => {
    setSelectedTopics([]);
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
          <div className="flex items-center gap-2">
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
        </div>
        {(topics || []).filter(topic => topic.status === "queued").length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectAll}
                disabled={generateSelectedMutation.isPending}
              >
                Selecionar Todos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearSelection}
                disabled={generateSelectedMutation.isPending}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Limpar
              </Button>
            </div>
            {selectedTopics.length > 0 && (
              <Button 
                onClick={handleGenerateSelected}
                disabled={generateSelectedMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {generateSelectedMutation.isPending 
                  ? `Gerando ${selectedTopics.length}...` 
                  : `Gerar ${selectedTopics.length} Artigos`
                }
              </Button>
            )}
          </div>
        )}
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
                  {topic.status === "queued" && (
                    <Checkbox
                      checked={selectedTopics.includes(topic.hashtag)}
                      onCheckedChange={() => handleTopicSelect(topic.hashtag)}
                      disabled={generateSelectedMutation.isPending}
                    />
                  )}
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
