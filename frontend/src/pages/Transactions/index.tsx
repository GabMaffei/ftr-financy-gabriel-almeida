/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_TRANSACTIONS } from "@/lib/graphql/queries/transaction";
import { GET_CATEGORIES } from "@/lib/graphql/queries/category";
import { DELETE_TRANSACTION } from "@/lib/graphql/mutations/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Trash2, Edit, Search, ArrowDownCircle, ArrowUpCircle, Loader2, ChevronLeft, ChevronRight,
  Tags, Briefcase, Car, Heart, PiggyBank, ShoppingCart, Ticket, Package, Utensils, 
  PawPrint, Home, Gift, Dumbbell, Book, ShoppingBag, BookOpen, FileText 
} from "lucide-react";
import { TransactionModal } from "./TransactionModal";

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
      icon?: string;
      color?: string;
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
  // 1. Estados Gerais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
  
  // 2. Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterPeriod, setFilterPeriod] = useState("ALL");

  // 3. Estados da Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 4. Consultas GraphQL
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

  // 5. Gerador Dinâmico de Períodos (Mês/Ano) a partir das transações reais
  const periodMap = new Map<string, string>();
  transactions.forEach(t => {
    const key = t.date.substring(0, 7); // "YYYY-MM"
    if (!periodMap.has(key)) {
      const [year, month] = key.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1);
      const label = dateObj.toLocaleDateString("pt-BR", { month: 'long', year: 'numeric' });
      periodMap.set(key, label.charAt(0).toUpperCase() + label.slice(1) + " / " + year);
    }
  });
  
  const availablePeriods = Array.from(periodMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  // 6. Aplicar Todos os Filtros Combinados
  const filteredTransactions = transactions.filter((t: any) => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "ALL" || t.type === filterType;
    const matchCategory = filterCategory === "ALL" || t.category.id === filterCategory;
    const matchPeriod = filterPeriod === "ALL" || t.date.substring(0, 7) === filterPeriod;
    return matchSearch && matchType && matchCategory && matchPeriod;
  });

  // 7. Calcular Paginação
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
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

      {/* Grid de Filtros */}
      <Card className="py-0 gap-0 shadow-sm">
       <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="space-y-2 w-full">
            <Label>Tipo</Label>
            <Select value={filterType} onValueChange={(val) => { setFilterType(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="INCOME">Entrada</SelectItem>
                <SelectItem value="EXPENSE">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full">
            <Label>Categoria</Label>
            <Select value={filterCategory} onValueChange={(val) => { setFilterCategory(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full">
            <Label>Período</Label>
            <Select value={filterPeriod} onValueChange={(val) => { setFilterPeriod(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Todos os períodos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {availablePeriods.map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela e Paginação */}
      <Card className="py-0 gap-0 overflow-hidden shadow-sm">
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
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Nenhuma transação encontrada.</td>
                </tr>
              ) : (
                paginatedTransactions.map((t: any) => {
                  
                  // 👇 Lógica que insere o Ícone e a Cor corretos em cada linha!
                  const colorClass = t.category.color && COLORS[t.category.color] ? COLORS[t.category.color] : { bg: "bg-secondary", text: "text-foreground" };
                  const IconComponent = t.category.icon && ICONS[t.category.icon] ? ICONS[t.category.icon] : Tags;

                  return (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{t.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}</td>
                      
                      <td className="px-6 py-4">
                        {/* 👇 A Pílula super elegante! */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass.bg} ${colorClass.text}`}>
                          <IconComponent className="h-3 w-3" />
                          {t.category.name}
                        </span>
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground bg-white">
            <div>
              {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} | {totalItems} resultados
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <Button 
                    key={page} 
                    variant={currentPage === page ? "default" : "outline"} 
                    className={`h-8 w-8 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}