import { Product, Prisma } from '@prisma/client'

export interface ProductsRepository {
  listByCouple(coupleId: number): Promise<Product[]>
  findByName(name: string): Promise<Product | null>
  create(data: Prisma.ProductUncheckedCreateInput): Promise<Product>
}
