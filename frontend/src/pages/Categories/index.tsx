/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/lib/graphql/queries/category";
import { DELETE_CATEGORY } from "@/lib/graphql/mutations/category";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tags, ArrowDownUp, Utensils, Trash2, Edit, Plus, Loader2,
  Briefcase, Car, Heart, PiggyBank, ShoppingCart, Ticket, Package, 
  PawPrint, Home, Gift, Dumbbell, Book, ShoppingBag, BookOpen, FileText 
} from "lucide-react";
import { CategoryModal } from "./CategoryModal";

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

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  transactions: any[];
}

export function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground mt-1">Organize suas transações por categorias</p>
        </div>

        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
        
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          categoryToEdit={categoryToEdit}
          onSuccess={() => {
            setIsModalOpen(false);
            refetch(); 
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="py-0 gap-0">
          <CardContent className="flex items-center gap-4 p-4">
            <Tags className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground uppercase font-medium mt-0.5">Total de categorias</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0 gap-0">
          <CardContent className="flex items-center gap-4 p-4">
            <ArrowDownUp className="h-8 w-8 text-purple-base" />
            <div>
              <p className="text-2xl font-bold">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground uppercase font-medium mt-0.5">Total de transações</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-0 gap-0">
          <CardContent className="flex items-center gap-4 p-4">
            <Utensils className="h-8 w-8 text-blue-base" />
            <div>
              <p className="text-2xl font-bold">{mostUsed}</p>
              <p className="text-xs text-muted-foreground uppercase font-medium mt-0.5">Categoria mais utilizada</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {categories.map((category) => {
          // Resolvemos o componente do ícone e as classes de cor com fallback de segurança
          const IconComponent = category.icon && ICONS[category.icon] ? ICONS[category.icon] : Tags;
          const colorClass = category.color && COLORS[category.color] ? COLORS[category.color] : { bg: "bg-primary/10", text: "text-primary" };

          return (
            <Card key={category.id} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                
                {/* 👇 Ícone e Fundo Dinâmicos */}
                <div className={`p-2 rounded-md ${colorClass.bg}`}>
                  <IconComponent className={`h-5 w-5 ${colorClass.text}`} />
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEdit(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                {/* 👇 Descrição Dinâmica */}
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2" title={category.description}>
                  {category.description || "Sem descrição."}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass.bg} ${colorClass.text}`}>
                    {category.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {category.transactions.length} itens
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}