import { useQuery } from "@apollo/client/react";
import { GET_DASHBOARD_DATA } from "@/lib/graphql/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Tipagens baseadas na nossa Query
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  category: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
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
  const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_DATA);

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
            <Wallet className="h-4 w-4 text-purple-base" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2">
            <ArrowUpCircle className="h-4 w-4 text-success" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">+ {formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-start gap-2 space-y-0 pb-2">
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Despesas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">- {formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Lista de Transações Recentes (Col-span 2) */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">Transações Recentes</CardTitle>
            <Button variant="link" className="text-primary p-0" asChild>
              <Link to="/transacoes">Ver todas &gt;</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Nenhuma transação cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.type === "INCOME" ? "text-success" : "text-destructive"}`}>
                        {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                      </p>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {t.category.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full gap-2 mt-6" variant="outline" asChild>
              <Link to="/transacoes">
                <Plus className="h-4 w-4 text-primary" /> <span className="text-primary font-medium">Nova transação</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium uppercase">Categorias</CardTitle>
            {/* 👈 Botão "Gerenciar" agora redireciona para Categorias */}
            <Button variant="link" className="text-primary p-0" asChild>
              <Link to="/categorias">Gerenciar &gt;</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center mt-4">Nenhuma categoria criada.</div>
            ) : (
              <div className="space-y-4 mt-4">
                {categories.map((c) => (
                  <div key={c.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-sm text-muted-foreground">{c.transactions.length} itens</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}