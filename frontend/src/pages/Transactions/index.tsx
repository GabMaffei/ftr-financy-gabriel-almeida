import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TRANSACTIONS } from "@/lib/graphql/queries/transaction";
import { GET_CATEGORIES } from "@/lib/graphql/queries/category";
import { DELETE_TRANSACTION } from "@/lib/graphql/mutations/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Search, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { TransactionModal } from "./TransactionModal";

interface TransactionData {
  listTransactions: {
    id: string;
    title: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    category: {
      id: string;
      name: string;
    };
  }[];
}

interface CategoryData {
  listCategories: {
    id: string;
    name: string;
  }[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

export function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: transData, loading: transLoading, refetch: refetchTrans } = useQuery<TransactionData>(GET_TRANSACTIONS);
  const { data: catData } = useQuery<CategoryData>(GET_CATEGORIES);

  const [deleteTransaction] = useMutation(DELETE_TRANSACTION, {
    onCompleted: () => refetchTrans()
  });

  const handleCreate = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: any) => {
    setTransactionToEdit(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta transação?")) {
      deleteTransaction({ variables: { id } });
    }
  };

  if (transLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  const transactions = transData?.listTransactions || [];
  const categories = catData?.listCategories || [];

  const filteredTransactions = transactions.filter((t: any) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transações</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as suas transações financeiras</p>
        </div>

        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" /> Nova transação
        </Button>

        <TransactionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transactionToEdit={transactionToEdit}
          categories={categories}
          onSuccess={() => {
            setIsModalOpen(false);
            refetchTrans();
          }}
        />
      </div>

      <Card>
        <CardContent className="p-4 flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Descrição</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Valor</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Nenhuma transação encontrada.</td>
                </tr>
              ) : (
                filteredTransactions.map((t: any) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/20">
                    <td className="px-6 py-4 font-medium text-foreground">{t.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-secondary rounded-full text-xs font-medium">{t.category.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 ${t.type === "INCOME" ? "text-success" : "text-destructive"}`}>
                        {t.type === "INCOME" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                        <span className="font-medium">{t.type === "INCOME" ? "Entrada" : "Saída"}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-bold ${t.type === "INCOME" ? "text-success" : "text-foreground"}`}>
                      {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(t)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}