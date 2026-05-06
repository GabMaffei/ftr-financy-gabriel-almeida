import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { AuthService } from "@/services/auth.service";
import { LoginInput, RegisterInput } from "../dtos/input/auth.input";
import { AuthOutput } from "@/dtos/output/auth.output";

@Resolver()
export class AuthResolver {
  private authService = new AuthService();

  @Query(() => String)
  hello() {
    return "API do Financy rodando com sucesso!";
  }

  @Mutation(() => AuthOutput)
  async register(
    @Arg("data", () => RegisterInput) data: RegisterInput
  ): Promise<AuthOutput> {
    return this.authService.register(data);
  }

  @Mutation(() => AuthOutput)
  async login(
    @Arg("data", () => LoginInput) data: LoginInput
  ): Promise<AuthOutput> {
    return this.authService.login(data);
  }
}