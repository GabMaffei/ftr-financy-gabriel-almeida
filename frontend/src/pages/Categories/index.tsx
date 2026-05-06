import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/lib/graphql/queries/category";
import { DELETE_CATEGORY } from "@/lib/graphql/mutations/category";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tags, ArrowDownUp, Utensils, Trash2, Edit, Plus, Loader2 } from "lucide-react";
import { CategoryModal } from "./CategoryModal";

// As tipagens ficam de fora, tudo certo!
interface Category {
  id: string;
  name: string;
  transactions: any[];
}

export function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);

  // Consultas GraphQL
  const { data, loading, refetch } = useQuery<{ listCategories: Category[] }>(GET_CATEGORIES);

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => refetch()
  });

  const handleCreate = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar? As transações vinculadas também podem ser apagadas.")) {
      deleteCategory({ variables: { id } });
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

  const categories = data?.listCategories || [];
  const totalTransactions = categories.reduce((acc, curr) => acc + curr.transactions.length, 0);

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

        {/* Botão que chama a função de abrir Modal de Criação */}
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
        
        {/* Componente Modal de Categoria Isolado */}
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          categoryToEdit={categoryToEdit}
          onSuccess={() => {
            setIsModalOpen(false);
            refetch(); // Recarrega a lista do GraphQL
          }}
        />
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
                
                {/* Botão que chama a função de abrir Modal de Edição passando os dados */}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(category)}>
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