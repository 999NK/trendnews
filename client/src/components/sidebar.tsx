import { Link, useLocation } from "wouter";
import { Bot, BarChart3, Newspaper, TrendingUp, Settings, FileText, Globe } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3, current: location === "/" },
    { name: "Artigos", href: "/articles", icon: FileText, current: location === "/articles" },
    { name: "Ver Blog", href: "/blog", icon: Globe, current: location === "/blog" },
    { name: "Configurações", href: "/settings", icon: Settings, current: location === "/settings" },
  ];

  return (
    <aside className="w-64 bg-card shadow-lg border-r border-border hidden md:block">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Grok AI News</h1>
            <p className="text-sm text-muted-foreground">Gerador Automático de Blog</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
