import { useQuery } from "@apollo/client/react";
import { GET_DASHBOARD_DATA } from "@/lib/graphql/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Loader2,
  Tags, Briefcase, Car, Heart, PiggyBank, ShoppingCart, Ticket, Package, Utensils, 
  PawPrint, Home, Gift, Dumbbell, Book, ShoppingBag, BookOpen, FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { TransactionModal } from "../Transactions/TransactionModal";

// 1. Mapeamento de Ícones
const ICONS: Record<string, React.ElementType> = {
  Briefcase, Car, Heart, PiggyBank, ShoppingCart, Ticket, Package, Utensils, 
  PawPrint, Home, Gift, Dumbbell, Book, ShoppingBag, BookOpen, FileText
};

// 2. Mapeamento de Cores para o Tailwind
const COLORS: Record<string, { bg: string, text: string }> = {
  green: { bg: "bg-green-base/10", text: "text-green-base" },
  blue: { bg: "bg-blue-base/10", text: "text-blue-base" },
  purple: { bg: "bg-purple-base/10", text: "text-purple-base" },
  pink: { bg: "bg-pink-base/10", text: "text-pink-base" },
  red: { bg: "bg-red-base/10", text: "text-red-base" },
  orange: { bg: "bg-orange-base/10", text: "text-orange-base" },
  yellow: { bg: "bg-yellow-base/10", text: "text-yellow-base" },
};

// Tipagens baseadas na nossa Query
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  category: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  transactions: {
    amount: number;
    type: "INCOME" | "EXPENSE";
  }[];
}

interface DashboardData {
  listTransactions: Transaction[];
  listCategories: Category[];
}

// Utilitário para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery<DashboardData>(GET_DASHBOARD_DATA);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Erro ao carregar os dados: {error.message}</div>;
  }

  const transactions = data?.listTransactions || [];
  const categories = data?.listCategories || [];

  // Cálculos do Resumo
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // Pegar as 5 transações mais recentes
  const recentTransactions = [...transactions].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2">
            <Wallet className="h-5 w-5 text-purple-base" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2">
            <ArrowUpCircle className="h-5 w-5 text-success" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+ {formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2">
            <ArrowDownCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Despesas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">- {formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Lista de Transações Recentes (Col-span 2) */}
        <Card className="md:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">Transações Recentes</CardTitle>
            <Button variant="link" className="text-primary p-0" asChild>
              <Link to="/transacoes">Ver todas &gt;</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Nenhuma transação cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {recentTransactions.map((t) => {
                  const colorClass = t.category.color && COLORS[t.category.color] ? COLORS[t.category.color] : { bg: "bg-secondary", text: "text-foreground" };
                  const IconComponent = t.category.icon && ICONS[t.category.icon] ? ICONS[t.category.icon] : Tags;

                  return (
                    <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <p className={`font-bold ${t.type === "INCOME" ? "text-success" : "text-foreground"}`}>
                          {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                        </p>
                        {/* 👇 Pílula Elegante com Ícone e Cor */}
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${colorClass.bg} ${colorClass.text}`}>
                          <IconComponent className="h-3 w-3" />
                          {t.category.name}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <Button className="w-full gap-2 mt-6" variant="outline" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 text-primary" /> <span className="text-primary font-medium">Nova transação</span>
            </Button>
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">Categorias</CardTitle>
            <Button variant="link" className="text-primary p-0" asChild>
              <Link to="/categorias">Gerenciar &gt;</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center mt-4">Nenhuma categoria criada.</div>
            ) : (
              <div className="space-y-4 mt-4">
                {categories.map((c) => {
                  const colorClass = c.color && COLORS[c.color] ? COLORS[c.color] : { bg: "bg-primary/10", text: "text-primary" };
                  const IconComponent = c.icon && ICONS[c.icon] ? ICONS[c.icon] : Tags;

                  return (
                    <div key={c.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {/* 👇 Caixinha com Ícone Colorido na lista lateral */}
                        <div className={`p-1.5 rounded-md ${colorClass.bg}`}>
                          <IconComponent className={`h-4 w-4 ${colorClass.text}`} />
                        </div>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{c.transactions.length} itens</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories} 
        onSuccess={() => {
          setIsModalOpen(false);
          refetch(); // Recarrega os dados logo após criar a transação
        }} 
      />
    </div>
  );
}