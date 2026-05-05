import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

// Não precisamos mais importar o "Database" do "better-sqlite3"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
  // Pega o caminho absoluto da raiz do projeto para evitar erros de diretório
  const dbPath = path.resolve(process.cwd(), 'dev.db')
  
  // No Prisma 7, basta instanciar o adapter passando a URL
  const adapter = new PrismaBetterSqlite3({ 
      url: `file:${dbPath}` 
  })
  
  return new PrismaClient({ adapter })
}

export const prismaClient = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
}