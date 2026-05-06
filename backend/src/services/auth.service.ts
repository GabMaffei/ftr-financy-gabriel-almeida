import { prismaClient } from "@/../prisma/prisma";
import { LoginInput, RegisterInput } from "@/dtos/input/auth.input";
import { comparePassword, hashPassword } from "@/utils/hash";
import { signJwt } from "@/utils/jwt";

export class AuthService {
  async register(data: RegisterInput) {
    const userExists = await prismaClient.user.findUnique({
      where: { email: data.email }
    });

    if (userExists) throw new Error("Este e-mail já está em uso.");

    const passwordHash = await hashPassword(data.password);

    const user = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: passwordHash,
      },
    });

    const token = signJwt({ id: user.id, email: user.email }, '7d');

    return { token, user };
  }

  async login(data: LoginInput) {
    const user = await prismaClient.user.findUnique({
      where: { email: data.email }
    });

    if (!user) throw new Error("Credenciais inválidas.");

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) throw new Error("Credenciais inválidas.");

    const token = signJwt({ id: user.id, email: user.email }, '7d');

    return { token, user };
  }
}