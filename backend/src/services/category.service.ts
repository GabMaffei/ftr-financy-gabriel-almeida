import { prismaClient } from "@/../prisma/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "@/dtos/input/category.input";

export class CategoryService {
  async create(data: CreateCategoryInput, userId: string) {
    return prismaClient.category.create({
      data: { ...data, userId }
    });
  }

  async listAll(userId: string) {
    return prismaClient.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
  }

  async update(id: string, data: UpdateCategoryInput, userId: string) {
    const category = await prismaClient.category.findFirst({ where: { id, userId } });
    if (!category) throw new Error("Categoria não encontrada.");

    return prismaClient.category.update({
      where: { id },
      data
    });
  }

  async delete(id: string, userId: string) {
    const category = await prismaClient.category.findFirst({ where: { id, userId } });
    if (!category) throw new Error("Categoria não encontrada.");

    await prismaClient.category.delete({ where: { id } });
    return true;
  }

  async findById(id: string, userId: string) {
    const category = await prismaClient.category.findFirst({ 
      where: { id, userId } 
    });
    
    if (!category) throw new Error("Categoria não encontrada.");
    
    return category;
  }
}