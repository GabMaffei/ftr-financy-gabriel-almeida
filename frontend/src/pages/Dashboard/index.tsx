import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12.847,32</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas do Mês</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+ R$ 4.250,00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do Mês</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">- R$ 2.180,45</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Lista de Transações Recentes (Col-span 2) */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button variant="link" className="text-primary p-0">Ver todas</Button>
          </CardHeader>
          <CardContent>
             {/* Aqui faremos o map das transações em breve */}
             <div className="text-center py-10 text-muted-foreground">
               Nenhuma transação recente encontrada.
             </div>
             <Button className="w-full gap-2 mt-4" variant="outline">
                <Plus className="h-4 w-4" /> Nova transação
             </Button>
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categorias</CardTitle>
            <Button variant="link" className="text-primary p-0">Gerenciar</Button>
          </CardHeader>
          <CardContent>
             {/* Resumo de categorias aqui */}
             <div className="space-y-4">
                <p className="text-sm text-muted-foreground italic">Em breve...</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}