import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GET_TRANSACTIONS } from "@/lib/graphql/queries/transaction";
import { GET_CATEGORIES } from "@/lib/graphql/queries/category";
import { CREATE_TRANSACTION, DELETE_TRANSACTION } from "@/lib/graphql/mutations/transaction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Search, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

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

// Validação do Form
const transactionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    title: z.string().min(2, "A descrição é obrigatória"),
    date: z.string().min(1, "A data é obrigatória"),
    amount: z.number({
        error: "O valor é obrigatório"
    }).positive("O valor deve ser maior que zero"),
    categoryId: z.string({
        error: "Por favor, selecione uma categoria"
    }).min(1, "Por favor, selecione uma categoria"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

// Utilitário para formatar moeda
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
};

export function Transactions() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Queries
    const { data: transData, loading: transLoading, refetch: refetchTrans } = useQuery<TransactionData>(GET_TRANSACTIONS);
    const { data: catData } = useQuery<CategoryData>(GET_CATEGORIES);

    // Mutations
    const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION, {
        onCompleted: () => {
            setIsModalOpen(false);
            reset();
            refetchTrans();
        }
    });

    const [deleteTransaction] = useMutation(DELETE_TRANSACTION, {
        onCompleted: () => refetchTrans()
    });

    // Form Hook
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionForm>({
        resolver: zodResolver(transactionSchema),
        defaultValues: { type: "EXPENSE" }
    });

    const selectedType = watch("type");

    const onSubmit = (formData: TransactionForm) => {
        // Ajuste de fuso horário para garantir que o backend grave a data correta
        const isoDate = new Date(formData.date + "T12:00:00.000Z").toISOString();

        createTransaction({
            variables: {
                data: {
                    title: formData.title,
                    amount: formData.amount,
                    type: formData.type,
                    categoryId: formData.categoryId,
                    date: isoDate
                }
            }
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Tem certeza que deseja deletar esta transação?")) {
            deleteTransaction({ variables: { id } });
        }
    };

    if (transLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

    const transactions = transData?.listTransactions || [];
    const categories = catData?.listCategories || [];

    // Filtro local simples pela barra de busca
    const filteredTransactions = transactions.filter((t: any) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Transações</h1>
                    <p className="text-muted-foreground mt-1">Gerencie todas as suas transações financeiras</p>
                </div>

                {/* Modal de Nova Transação */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Nova transação
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova transação</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">

                            {/* CORREÇÃO VISUAL 1: flex-1 em vez de w-full para não vazar da tela */}
                            {/* Botões de Seleção de Tipo Limpos (Usando Variantes Nativas) */}
                            <div className="flex gap-4 w-full">
                                <Button
                                    type="button"
                                    variant={selectedType === "EXPENSE" ? "destructive" : "outline"}
                                    className="flex-1 gap-2"
                                    onClick={() => setValue("type", "EXPENSE")}
                                >
                                    <ArrowDownCircle className="h-4 w-4" /> Despesa
                                </Button>
                                <Button
                                    type="button"
                                    variant={selectedType === "INCOME" ? "default" : "outline"}
                                    className="flex-1 gap-2"
                                    onClick={() => setValue("type", "INCOME")}
                                >
                                    <ArrowUpCircle className="h-4 w-4" /> Receita
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Input placeholder="Ex. Almoço no restaurante" {...register("title")} className={errors.title ? "border-destructive" : ""} />
                                {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Data</Label>
                                    <Input type="date" {...register("date")} className={errors.date ? "border-destructive" : ""} />
                                    {errors.date && <span className="text-xs text-destructive">{errors.date.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor</Label>
                                    <Input type="number" step="0.01" placeholder="R$ 0,00" {...register("amount", { valueAsNumber: true })} className={errors.amount ? "border-destructive" : ""} />
                                    {errors.amount && <span className="text-xs text-destructive">{errors.amount.message}</span>}
                                </div>
                            </div>

                            <div className="space-y-2 w-full">
                                <Label>Categoria</Label>
                                <Select onValueChange={(val) => setValue("categoryId", val)}>
                                    <SelectTrigger className={`w-full ${errors.categoryId ? "border-destructive" : ""}`}>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.categoryId && <span className="text-xs text-destructive">{errors.categoryId.message}</span>}
                            </div>

                            <Button type="submit" className="w-full" disabled={creating}>
                                {creating ? "Salvando..." : "Salvar"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
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

            {/* Lista de Transações (Design tipo Tabela) */}
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
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</td>
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
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