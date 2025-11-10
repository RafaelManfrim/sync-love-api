import { Product, Prisma } from '@prisma/client'
import { ProductsRepository } from '../products-repository'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  async listByCouple(coupleId: number) {
    return this.items.filter((item) => item.couple_id === coupleId)
  }

  async findByName(name: string) {
    const product = this.items.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    )

    return product || null
  }

  async create(data: Prisma.ProductUncheckedCreateInput) {
    const product: Product = {
      id: this.items.length + 1,
      name: data.name,
      unit_of_measure: data.unit_of_measure,
      couple_id: data.couple_id,
    }

    this.items.push(product)

    return product
  }
}
