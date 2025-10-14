import { Product, Prisma } from '@prisma/client'

export interface ProductsRepository {
  findByName(name: string): Promise<Product | null>
  create(data: Prisma.ProductUncheckedCreateInput): Promise<Product>
}
