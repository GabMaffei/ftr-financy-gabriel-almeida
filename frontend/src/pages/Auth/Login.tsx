import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION } from "@/lib/graphql/mutations/auth";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "lucide-react";
import logo from "@/assets/financy_logo.svg";

// Validação com Zod
const loginSchema = z.object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(1, "A senha é obrigatória"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginMutationResponse {
    login: {
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
}

export function Login() {
    const navigate = useNavigate();
    const loginAction = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const [loginMutation, { loading }] = useMutation<LoginMutationResponse>(LOGIN_MUTATION, {
        onCompleted: (data) => {
            loginAction(data.login.user, data.login.token);
            navigate("/"); // Manda pro Dashboard
        },
        onError: (error) => {
            alert(error.message); // Aqui podemos colocar um Toast do Shadcn depois
        }
    });

    const onSubmit = (data: LoginForm) => {
        loginMutation({ variables: { data } });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="mb-8 flex items-center justify-center">
                <img src={logo} alt="Logo Financy" className="h-8" />
            </div>

            <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-sm border">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Fazer login</h1>
                    <p className="text-muted-foreground mt-1">Entre na sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" />
                            <Label htmlFor="remember" className="font-normal text-muted-foreground cursor-pointer">
                                Lembrar-me
                            </Label>
                        </div>
                        <a href="#" className="text-sm text-primary font-medium hover:underline">
                            Recuperar senha
                        </a>
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
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
                        Ainda não tem uma conta?
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                        <Link to="/register">
                            <User className="mr-2 h-4 w-4" /> {/* Ícone adicionado aqui */}
                            Criar conta
                        </Link>
                    </Button>
                </form>
            </div>
        </div>
    );
}