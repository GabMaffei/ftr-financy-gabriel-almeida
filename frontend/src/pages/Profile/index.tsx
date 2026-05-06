import { useAuthStore } from "@/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function Profile() {
  const { user, logout } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" }
  });

  const onSubmit = (data: ProfileForm) => {
    console.log("Atualizar perfil:", data);
    // Aqui chamaria a mutation de update user
    alert("Funcionalidade de salvar alterações em desenvolvimento!");
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent md:bg-card md:border md:shadow-sm">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-gray-200 text-primary font-bold">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" className="pl-10" {...register("name")} />
              </div>
              {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user?.email} disabled className="bg-secondary/50 cursor-not-allowed" />
              <p className="text-[10px] text-muted-foreground italic">O e-mail não pode ser alterado</p>
            </div>

            <Button type="submit" className="w-full">Salvar alterações</Button>
            
            <Button variant="outline" type="button" className="w-full gap-2 text-destructive hover:bg-destructive/10" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sair da conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}