import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { CREATE_CATEGORY, UPDATE_CATEGORY } from "@/lib/graphql/mutations/category";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const categorySchema = z.object({
  name: z.string().min(2, "O nome da categoria é obrigatório"),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: { id: string; name: string } | null;
  onSuccess: () => void;
}

export function CategoryModal({ isOpen, onClose, categoryToEdit, onSuccess }: CategoryModalProps) {
  const isEditing = !!categoryToEdit;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "" }
  });

  // Preenche o formulário quando o modal abre para edição
  useEffect(() => {
    if (isOpen && categoryToEdit) {
      reset({ name: categoryToEdit.name });
    } else if (isOpen && !categoryToEdit) {
      reset({ name: "" }); // Limpa se for criação
    }
  }, [isOpen, categoryToEdit, reset]);

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, { onCompleted: onSuccess });
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, { onCompleted: onSuccess });

  const onSubmit = (formData: CategoryForm) => {
    if (isEditing) {
      updateCategory({ variables: { id: categoryToEdit.id, data: { name: formData.name } } });
    } else {
      createCategory({ variables: { data: { name: formData.name } } });
    }
  };

  const loading = creating || updating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}