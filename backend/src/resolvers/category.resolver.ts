import { Arg, Mutation, Query, Resolver, Root, UseMiddleware, FieldResolver } from "type-graphql";
import { IsAuth } from "@/middleware/auth.middleware";
import { GqlUser } from "@/graphql/decorator/user.decorator";
import { User } from "@/generated/prisma/client"
import { CategoryModel } from "@/models/category.model";
import { CategoryService } from "@/services/category.service";
import { CreateCategoryInput, UpdateCategoryInput } from "@/dtos/input/category.input";
import { TransactionService } from "@/services/transaction.service";
import { TransactionModel } from "@/models/transaction.model";

@Resolver(() => CategoryModel)
export class CategoryResolver {
  private categoryService = new CategoryService();
  private transactionService = new TransactionService(); // 3. Instancie o service de transações

  @Query(() => [CategoryModel])
  @UseMiddleware(IsAuth)
  async listCategories(@GqlUser() user: User) {
    return this.categoryService.listAll(user.id);
  }

  @Mutation(() => CategoryModel)
  @UseMiddleware(IsAuth)
  async createCategory(
    @Arg("data", () => CreateCategoryInput) data: CreateCategoryInput,
    @GqlUser() user: User
  ) {
    return this.categoryService.create(data, user.id);
  }

  @Mutation(() => CategoryModel)
  @UseMiddleware(IsAuth)
  async updateCategory(
    @Arg("id", () => String) id: string,
    @Arg("data", () => UpdateCategoryInput) data: UpdateCategoryInput,
    @GqlUser() user: User
  ) {
    return this.categoryService.update(id, data, user.id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(IsAuth)
  async deleteCategory(@Arg("id", () => String) id: string, @GqlUser() user: User) {
    return this.categoryService.delete(id, user.id);
  }

  @FieldResolver(() => [TransactionModel])
  async transactions(@Root() category: CategoryModel, @GqlUser() user: User) {
    return this.transactionService.listByCategory(category.id, user.id);
  }
}