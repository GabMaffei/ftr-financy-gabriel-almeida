import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { AuthService } from "@/services/auth.service";
import { LoginInput, RegisterInput } from "../dtos/input/auth.input";
import { AuthOutput } from "@/dtos/output/auth.output";
import { GqlUser } from "@/graphql/decorator/user.decorator";
import { IsAuth } from "@/middleware/auth.middleware";
import { UserModel } from "@/models/user.model";
import { User } from "@/generated/prisma/client";
import { prismaClient } from "@/../prisma/prisma";

@Resolver()
export class AuthResolver {
  private authService = new AuthService();

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

// 👇 NOVA MUTATION PARA O PERFIL
  @Mutation(() => UserModel)
  @UseMiddleware(IsAuth)
  async updateProfile(
    @Arg("name", () => String) name: string,
    @GqlUser() user: User
  ): Promise<UserModel> {
    return prismaClient.user.update({
      where: { id: user.id },
      data: { name }
    });
  }
}