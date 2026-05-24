/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CREATE_CATEGORY, UPDATE_CATEGORY } from "@/lib/graphql/mutations/category";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Ícones exatos do Figma
import { Briefcase, Car, Heart, PiggyBank, ShoppingCart, Ticket, Package, Utensils, PawPrint, Home, Gift, Dumbbell, Book, ShoppingBag, BookOpen, FileText } from "lucide-react";

// Lista de Ícones
const ICONS = [
  { id: "Briefcase", icon: Briefcase }, { id: "Car", icon: Car }, { id: "Heart", icon: Heart }, { id: "PiggyBank", icon: PiggyBank },
  { id: "ShoppingCart", icon: ShoppingCart }, { id: "Ticket", icon: Ticket }, { id: "Package", icon: Package }, { id: "Utensils", icon: Utensils },
  { id: "PawPrint", icon: PawPrint }, { id: "Home", icon: Home }, { id: "Gift", icon: Gift }, { id: "Dumbbell", icon: Dumbbell },
  { id: "Book", icon: Book }, { id: "ShoppingBag", icon: ShoppingBag }, { id: "BookOpen", icon: BookOpen }, { id: "FileText", icon: FileText }
];

// Lista de Cores do seu Tailwind
const COLORS = [
  { id: "green", bg: "bg-green-base" },
  { id: "blue", bg: "bg-blue-base" },
  { id: "purple", bg: "bg-purple-base" },
  { id: "pink", bg: "bg-pink-base" },
  { id: "red", bg: "bg-red-base" },
  { id: "orange", bg: "bg-orange-base" },
  { id: "yellow", bg: "bg-yellow-base" },
];

const categorySchema = z.object({
  name: z.string().min(2, "O nome da categoria é obrigatório"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: any | null;
  onSuccess: () => void;
}

export function CategoryModal({ isOpen, onClose, categoryToEdit, onSuccess }: CategoryModalProps) {
  const isEditing = !!categoryToEdit;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", icon: "Briefcase", color: "green" }
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  useEffect(() => {
    if (isOpen && categoryToEdit) {
      reset({ 
        name: categoryToEdit.name, 
        description: categoryToEdit.description || "",
        icon: categoryToEdit.icon || "Briefcase",
        color: categoryToEdit.color || "green"
      });
    } else if (isOpen && !categoryToEdit) {
      reset({ name: "", description: "", icon: "Briefcase", color: "green" }); 
    }
  }, [isOpen, categoryToEdit, reset]);

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, { onCompleted: onSuccess });
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, { onCompleted: onSuccess });

  const onSubmit = (formData: CategoryForm) => {
    const data = {
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      color: formData.color
    };

    if (isEditing) {
      updateCategory({ variables: { id: categoryToEdit.id, data } });
    } else {
      createCategory({ variables: { data } });
    }
  };

  const loading = creating || updating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Organize suas transações com categorias
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          
          <div className="space-y-2">
            <Label htmlFor="name">Título</Label>
            <Input id="name" placeholder="Ex. Alimentação" {...register("name")} className={errors.name ? "border-destructive" : ""} />
            {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" placeholder="Descrição da categoria" {...register("description")} />
          </div>

          <div className="pt-2">
            <Label className="text-muted-foreground font-normal text-xs uppercase mb-3 block">Opcional</Label>
            
            {/* Grid de Ícones */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm font-medium">Ícone</Label>
              <div className="grid grid-cols-8 gap-2">
                {ICONS.map((Item) => (
                  <button
                    key={Item.id}
                    type="button"
                    onClick={() => setValue("icon", Item.id)}
                    className={`flex items-center justify-center p-2 rounded-md border transition-all ${
                      selectedIcon === Item.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Item.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Paleta de Cores */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cor</Label>
              <div className="flex gap-2">
                {COLORS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setValue("color", col.id)}
                    className={`h-6 w-8 rounded-md transition-all ${col.bg} ${
                      selectedColor === col.id ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-80 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}