import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, TrendingUp, Cloud, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Artigos Gerados",
      value: stats?.articlesGenerated || 0,
      change: "+12%",
      changeType: "increase",
      changeText: "vs mês passado",
      icon: Newspaper,
      color: "bg-primary",
    },
    {
      title: "Trending Topics",
      value: stats?.trendingTopicsCount || 0,
      change: "+5",
      changeType: "increase",
      changeText: "novos hoje",
      icon: TrendingUp,
      color: "bg-accent",
    },
    {
      title: "Chamadas API",
      value: stats?.apiCalls || 0,
      change: "-8%",
      changeType: "decrease",
      changeText: "vs ontem",
      icon: Cloud,
      color: "bg-success",
    },
    {
      title: "Taxa de Sucesso",
      value: `${stats?.successRate || 98.5}%`,
      change: "+0.3%",
      changeType: "increase",
      changeText: "vs semana passada",
      icon: CheckCircle,
      color: "bg-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-surface shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-xl ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {stat.changeType === "increase" ? (
                  <ArrowUp className="text-success mr-1 w-4 h-4" />
                ) : (
                  <ArrowDown className="text-error mr-1 w-4 h-4" />
                )}
                <span className={stat.changeType === "increase" ? "text-success" : "text-error"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">{stat.changeText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
