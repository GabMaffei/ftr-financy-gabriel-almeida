import { MiddlewareFn } from "type-graphql";
import { GraphqlContext } from "@/graphql/context/index";

export const IsAuth: MiddlewareFn<GraphqlContext> = async ({ context }, next) => {
  if (!context.user) {
    throw new Error("Não autorizado. Por favor, faça login.");
  }
  return next();
};