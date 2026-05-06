import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CREATE_TRANSACTION, UPDATE_TRANSACTION } from "@/lib/graphql/mutations/transaction";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

// Validação com Zod corrigida para TypeScript estrito
const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  title: z.string().min(2, "A descrição é obrigatória"),
  date: z.string().min(1, "A data é obrigatória"),
  amount: z.number({
    error: "O valor é obrigatório"
  })
  .positive("O valor deve ser maior que zero")
  .or(z.nan().transform(() => 0)), 
  categoryId: z.string().min(1, "Por favor, selecione uma categoria"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: any | null;
  categories: { id: string; name: string }[];
  onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, transactionToEdit, categories, onSuccess }: TransactionModalProps) {
  const isEditing = !!transactionToEdit;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "EXPENSE", title: "", date: "", categoryId: "" }
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("categoryId"); // Observa o valor para o Select controlado

  // Preenche o formulário quando o modal abre para edição
  useEffect(() => {
    if (isOpen && transactionToEdit) {
      reset({
        type: transactionToEdit.type,
        title: transactionToEdit.title,
        amount: transactionToEdit.amount,
        categoryId: transactionToEdit.category?.id || "",
        // Converte a data do banco (ISO) para o formato YYYY-MM-DD que o input type="date" exige
        date: transactionToEdit.date ? new Date(transactionToEdit.date).toISOString().split("T")[0] : "",
      });
    } else if (isOpen && !transactionToEdit) {
      reset({ type: "EXPENSE", title: "", date: "", categoryId: "" }); 
    }
  }, [isOpen, transactionToEdit, reset]);

  const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION, { onCompleted: onSuccess });
  const [updateTransaction, { loading: updating }] = useMutation(UPDATE_TRANSACTION, { onCompleted: onSuccess });

  const onSubmit = (formData: TransactionForm) => {
    const isoDate = new Date(formData.date + "T12:00:00.000Z").toISOString();

    const variablesData = {
      title: formData.title,
      amount: formData.amount,
      type: formData.type,
      categoryId: formData.categoryId,
      date: isoDate
    };

    if (isEditing) {
      updateTransaction({ variables: { id: transactionToEdit.id, data: variablesData } });
    } else {
      createTransaction({ variables: { data: variablesData } });
    }
  };

  const loading = creating || updating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
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
            <Select value={selectedCategoryId} onValueChange={(val) => setValue("categoryId", val)}>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}