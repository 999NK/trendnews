import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, RefreshCw, Settings } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import StatsCards from "@/components/stats-cards";
import RecentArticles from "@/components/recent-articles";
import TrendingTopics from "@/components/trending-topics";
import SettingsModal from "@/components/settings-modal";
import LoadingOverlay from "@/components/loading-overlay";

export default function Dashboard() {
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/generate-all"),
    onSuccess: () => {
      setLoadingOpen(true);
      setGenerationProgress(0);
      
      // Simulate progress updates
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setLoadingOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api/trending-topics"] });
            toast({
              title: "Sucesso",
              description: "Geração de artigos iniciada com sucesso",
            });
            return 100;
          }
          return prev + 10;
        });
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao iniciar a geração de artigos",
        variant: "destructive",
      });
    },
  });

  const fetchTrendsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/trending-topics/fetch"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trending-topics"] });
      toast({
        title: "Success",
        description: "Latest trends fetched successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to fetch trends",
        variant: "destructive",
      });
    },
  });

  const handleGenerateNow = () => {
    generateMutation.mutate();
  };

  const handleFetchTrends = () => {
    fetchTrendsMutation.mutate();
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <Header title="Dashboard" />
        
        <div className="p-6 overflow-y-auto h-full">
          {/* Stats Cards */}
          <div className="mb-8">
            <StatsCards />
          </div>

          {/* Action Buttons */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-primary text-white hover:bg-blue-700 font-semibold"
                onClick={handleGenerateNow}
                disabled={generateMutation.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                {generateMutation.isPending ? "Iniciando..." : "Gerar Artigos Agora"}
              </Button>
              <Button 
                variant="outline"
                onClick={handleFetchTrends}
                disabled={fetchTrendsMutation.isPending}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${fetchTrendsMutation.isPending ? 'animate-spin' : ''}`} />
                Buscar Tendências Recentes
              </Button>
              <SettingsModal>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Sistema
                </Button>
              </SettingsModal>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <RecentArticles />
            <TrendingTopics />
          </div>

          {/* System Activity */}
          <SystemActivity />
        </div>
      </main>

      <LoadingOverlay 
        open={loadingOpen}
        onOpenChange={setLoadingOpen}
        progress={generationProgress}
        message="Gerando Artigos"
        details="Grok AI está analisando tendências e criando artigos detalhados..."
      />
    </div>
  );
}

function SystemActivity() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/logs"],
  });

  if (isLoading) {
    return (
      <Card className="bg-surface shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Atividade do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100">
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
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

  const recentLogs = logs?.slice(0, 5) || [];

  return (
    <Card className="bg-surface shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Atividade do Sistema</CardTitle>
          <Button variant="ghost" size="sm">
            Ver Todos os Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                log.type === "success" ? "bg-success" :
                log.type === "error" ? "bg-error" :
                log.type === "warning" ? "bg-warning" :
                "bg-primary"
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-secondary">{log.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`status-badge ${
                  log.type === "success" ? "status-success" :
                  log.type === "error" ? "status-error" :
                  log.type === "warning" ? "status-warning" :
                  "status-info"
                }`}>
                  {log.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
