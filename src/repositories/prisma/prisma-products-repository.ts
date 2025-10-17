import { prisma } from '@/lib/prisma'
import { Product, Prisma } from '@prisma/client'
import { ProductsRepository } from '../products-repository'

export class PrismaProductsRepository implements ProductsRepository {
  async listByCouple(coupleId: number): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: {
        couple_id: coupleId,
      },
    })
    return products
  }

  async findByName(name: string): Promise<Product | null> {
    const product = await prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive', // Busca ignorando maiúsculas/minúsculas
        },
      },
    })
    return product
  }

  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    const product = await prisma.product.create({
      data,
    })
    return product
  }
}
