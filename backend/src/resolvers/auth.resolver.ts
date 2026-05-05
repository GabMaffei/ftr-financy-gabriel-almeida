import { Arg, Mutation, Resolver } from "type-graphql";
import { AuthService } from "@/services/auth.services";
import { LoginInput, RegisterInput } from "@/dtos/input/auth.input";
import { AuthOutput } from "@/dtos/output/auth.output";

@Resolver()
export class AuthResolver {
  private authService = new AuthService();

  @Mutation(() => AuthOutput)
  async register(@Arg("data") data: RegisterInput): Promise<AuthOutput> {
    return this.authService.register(data);
  }

  @Mutation(() => AuthOutput)
  async login(@Arg("data") data: LoginInput): Promise<AuthOutput> {
    return this.authService.login(data);
  }
}