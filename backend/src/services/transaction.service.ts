import { prismaClient } from "@/../prisma/prisma";
import { CreateTransactionInput, UpdateTransactionInput } from "@/dtos/input/transaction.input";

export class TransactionService {
  async create(data: CreateTransactionInput, userId: string) {
    const category = await prismaClient.category.findFirst({
      where: { 
        id: data.categoryId, 
        userId: userId 
      }
    });

    if (!category) {
      throw new Error("A categoria informada não existe ou não pertence a você.");
    }
    
    return prismaClient.transaction.create({
      data: { ...data, userId }
    });
  }

  async listAll(userId: string) {
    return prismaClient.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' }
    });
  }

  async update(id: string, data: UpdateTransactionInput, userId: string) {
    const transaction = await prismaClient.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new Error("Transação não encontrada.");

    if (data.categoryId) {
      const category = await prismaClient.category.findFirst({
        where: { 
          id: data.categoryId, 
          userId: userId 
        }
      });

      if (!category) {
        throw new Error("A nova categoria informada não existe ou não pertence a você.");
      }
    }

    return prismaClient.transaction.update({
      where: { id },
      data
    });
  }

  async delete(id: string, userId: string) {
    const transaction = await prismaClient.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new Error("Transação não encontrada.");

    await prismaClient.transaction.delete({ where: { id } });
    return true;
  }

  async listByCategory(categoryId: string, userId: string) {
    return prismaClient.transaction.findMany({
      where: { 
        categoryId, 
        userId // Mantemos a segurança do isolamento!
      },
      orderBy: { date: 'desc' }
    });
  }
}