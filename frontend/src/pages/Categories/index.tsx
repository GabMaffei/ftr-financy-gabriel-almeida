import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GET_CATEGORIES } from "@/lib/graphql/queries/category";
import { CREATE_CATEGORY, DELETE_CATEGORY } from "@/lib/graphql/mutations/category";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tags, ArrowDownUp, Utensils, Trash2, Edit, Plus, Loader2 } from "lucide-react";

// Validação do Form
const categorySchema = z.object({
  name: z.string().min(2, "O nome da categoria é obrigatório"),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  transactions: any[];
}

export function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Consultas GraphQL
  const { data, loading, refetch } = useQuery<{ listCategories: Category[] }>(GET_CATEGORIES);
  
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    onCompleted: () => {
      setIsModalOpen(false);
      reset();
      refetch(); // Atualiza a lista após criar
    }
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => refetch()
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema)
  });

  const onSubmit = (formData: CategoryForm) => {
    createCategory({ variables: { data: { name: formData.name } } });
  };

  const handleDelete = (id: string) => {
    if(confirm("Tem certeza que deseja deletar? As transações vinculadas também podem ser apagadas.")) {
      deleteCategory({ variables: { id } });
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  const categories = data?.listCategories || [];
  const totalTransactions = categories.reduce((acc, curr) => acc + curr.transactions.length, 0);

  // Descobrir a categoria mais usada
  let mostUsed = "Nenhuma";
  if (categories.length > 0) {
    const sorted = [...categories].sort((a, b) => b.transactions.length - a.transactions.length);
    if (sorted[0].transactions.length > 0) mostUsed = sorted[0].name;
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground mt-1">Organize suas transações por categorias</p>
        </div>
        
        {/* Modal Embutido com Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Título</Label>
                <Input 
                  id="name" 
                  placeholder="Ex. Alimentação" 
                  {...register("name")} 
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Tags className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground uppercase font-medium">Total de categorias</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <ArrowDownUp className="h-8 w-8 text-purple-base" />
            <div>
              <p className="text-2xl font-bold">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground uppercase font-medium">Total de transações</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Utensils className="h-8 w-8 text-blue-base" />
            <div>
              <p className="text-2xl font-bold">{mostUsed}</p>
              <p className="text-xs text-muted-foreground uppercase font-medium">Categoria mais utilizada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Categorias */}
      <div className="grid gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <Card key={category.id} className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="bg-primary/10 p-2 rounded-md">
                <Tags className="h-5 w-5 text-primary" />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-bold text-lg mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">Categoria padrão do sistema.</p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-foreground">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {category.transactions.length} itens
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}