import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Newspaper, Trash2, ExternalLink, Globe, EyeOff, Calendar, Hash, FileText, AlertCircle, CheckCircle, Eye, ThumbsUp, ThumbsDown, Clock } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function Articles() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/articles"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Sucesso",
        description: "Artigo excluído com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir artigo",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/articles/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Sucesso",
        description: "Artigo publicado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao publicar artigo",
        variant: "destructive",
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/articles/${id}/unpublish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Sucesso",
        description: "Artigo despublicado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao despublicar artigo",
        variant: "destructive",
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/articles/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Sucesso",
        description: "Artigo aprovado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao aprovar artigo",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/articles/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Sucesso",
        description: "Artigo rejeitado",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao rejeitar artigo",
        variant: "destructive",
      });
    },
  });

  const submitForReviewMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/articles/${id}/submit-for-review`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Sucesso",
        description: "Artigo enviado para análise",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao enviar artigo para análise",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este artigo?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePublish = (id: number) => {
    publishMutation.mutate(id);
  };

  const handleUnpublish = (id: number) => {
    unpublishMutation.mutate(id);
  };

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate(id);
  };

  const handleSubmitForReview = (id: number) => {
    submitForReviewMutation.mutate(id);
  };

  const filteredArticles = articles?.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.hashtag.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <Header title="Artigos" />
        
        <div className="p-6 overflow-y-auto h-full">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background dark:bg-card"
              />
            </div>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum artigo encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Nenhum artigo corresponde à sua pesquisa." : "Gere seu primeiro artigo para começar."}
                  </p>
                  <Link href="/">
                    <Button>Ir para Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id} className="bg-card shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Newspaper className="text-muted-foreground w-8 h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center space-x-2 ml-4">
                            {/* Status-based actions */}
                            {article.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSubmitForReview(article.id)}
                                disabled={submitForReviewMutation.isPending}
                                title="Enviar para análise"
                              >
                                <Clock className="w-4 h-4 text-blue-500" />
                              </Button>
                            )}
                            
                            {article.status === 'under_review' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(article.id)}
                                  disabled={approveMutation.isPending}
                                  title="Aprovar artigo"
                                >
                                  <ThumbsUp className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(article.id)}
                                  disabled={rejectMutation.isPending}
                                  title="Rejeitar artigo"
                                >
                                  <ThumbsDown className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            
                            {article.status === 'approved' && !article.published && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePublish(article.id)}
                                disabled={publishMutation.isPending}
                                title="Publicar artigo"
                              >
                                <Globe className="w-4 h-4 text-green-500" />
                              </Button>
                            )}
                            
                            {article.published && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnpublish(article.id)}
                                disabled={unpublishMutation.isPending}
                                title="Despublicar artigo"
                              >
                                <EyeOff className="w-4 h-4 text-orange-500" />
                              </Button>
                            )}
                            
                            <Link href={`/articles/${article.id}`}>
                              <Button variant="ghost" size="sm" title="Ver artigo">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(article.id)}
                              disabled={deleteMutation.isPending}
                              title="Excluir artigo"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="text-xs">
                              {article.hashtag}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={article.published ? "default" : "secondary"}
                                className={`text-xs ${
                                  article.published ? "bg-green-500 text-white" : 
                                  article.status === "approved" ? "bg-blue-500 text-white" :
                                  article.status === "under_review" ? "bg-yellow-500 text-black" : 
                                  article.status === "rejected" ? "bg-red-500 text-white" : 
                                  "bg-gray-500 text-white"
                                }`}
                              >
                                {article.published ? "Publicado" : 
                                 article.status === "approved" ? "Aprovado" :
                                 article.status === "under_review" ? "Em Análise" :
                                 article.status === "rejected" ? "Rejeitado" : 
                                 "Rascunho"}
                              </Badge>
                              {article.published && (
                                <span className="text-xs text-muted-foreground flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {article.publishedAt && formatDistanceToNow(new Date(article.publishedAt), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Criado {formatDistanceToNow(new Date(article.createdAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
