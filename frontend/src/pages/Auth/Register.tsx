import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { REGISTER_MUTATION } from "@/lib/graphql/mutations/auth";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/financy_logo.svg";
import { LogIn } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

interface RegisterMutationResponse {
  register: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export function Register() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [registerMutation, { loading }] = useMutation<RegisterMutationResponse>(REGISTER_MUTATION, {
    onCompleted: (data) => {
      if (data) {
        loginAction(data.register.user, data.register.token);
        navigate("/");
      }
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation({ variables: { data } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center justify-center">
        <img src={logo} alt="Logo Financy" className="h-8" />
      </div>


      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-sm border">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-muted-foreground mt-1">Comece a controlar suas finanças ainda hoje</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              placeholder="mail@exemplo.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password ? (
              <span className="text-xs text-destructive">{errors.password.message}</span>
            ) : (
              <p className="text-xs text-muted-foreground">A senha deve ter no mínimo 8 caracteres</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground mb-4">
            Já tem uma conta?
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Fazer login
            </Link>
          </Button>
        </form>
      </div>
    </div>
  );
}