import { createParameterDecorator, ResolverData } from "type-graphql";
import { GraphqlContext } from "../context";
import { prismaClient } from "@/../prisma/prisma";

export const GqlUser = () => {
  return createParameterDecorator(
    async ({ context }: ResolverData<GraphqlContext>) => {
      if (!context || !context.user) return null;

      try {
        const user = await prismaClient.user.findUnique({
          where: { id: context.user },
        });
        return user;
      } catch (error) {
        throw new Error("Erro ao buscar usuário logado");
      }
    },
  );
};