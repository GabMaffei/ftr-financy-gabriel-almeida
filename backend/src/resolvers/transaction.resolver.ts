import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { IsAuth } from "@/middleware/auth.middleware";
import { GqlUser } from "@/graphql/decorator/user.decorator";
import { User } from "@/generated/prisma/client"
import { TransactionModel } from "@/models/transaction.model";
import { TransactionService } from "@/services/transaction.service";
import { CreateTransactionInput, UpdateTransactionInput } from "@/dtos/input/transaction.input";

@Resolver()
export class TransactionResolver {
  private transactionService = new TransactionService();

  @Query(() => [TransactionModel])
  @UseMiddleware(IsAuth)
  async listTransactions(@GqlUser() user: User) {
    return this.transactionService.listAll(user.id);
  }

  @Mutation(() => TransactionModel)
  @UseMiddleware(IsAuth)
  async createTransaction(
    @Arg("data", () => CreateTransactionInput) data: CreateTransactionInput,
    @GqlUser() user: User
  ) {
    return this.transactionService.create(data, user.id);
  }

  @Mutation(() => TransactionModel)
  @UseMiddleware(IsAuth)
  async updateTransaction(
    @Arg("id", () => String) id: string,
    @Arg("data", () => UpdateTransactionInput) data: UpdateTransactionInput,
    @GqlUser() user: User
  ) {
    return this.transactionService.update(id, data, user.id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth)
  async deleteTransaction(@Arg("id", () => String) id: string,@GqlUser() user: User) {
    return this.transactionService.delete(id, user.id);
  }
}