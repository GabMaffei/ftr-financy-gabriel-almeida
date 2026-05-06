import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutDashboard, ReceiptCent, Tags, LogOut } from "lucide-react";
import logo from "@/assets/financy_logo.svg";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Transações", path: "/transacoes", icon: ReceiptCent },
    { label: "Categorias", path: "/categorias", icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 bg-card border-b flex items-center justify-between px-8">
        <div className="flex items-center gap-12">
          <img src={logo} alt="Financy" className="h-6" />

          <nav className="flex items-center gap-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  asChild
                  className="gap-2"
                >
                  <Link to={item.path}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/perfil"
            className="flex items-center gap-3 text-right hover:opacity-80 transition-opacity rounded-md p-1"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
            <Avatar>
              <AvatarFallback className="bg-gray-200 text-primary font-bold">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <Button variant="ghost" size="icon" onClick={logout} title="Sair">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}