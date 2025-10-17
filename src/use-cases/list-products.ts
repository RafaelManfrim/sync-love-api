import { Product } from '@prisma/client'
import { ProductsRepository } from '@/repositories/products-repository'

interface ListProductsUseCaseRequest {
  coupleId: number
}

interface ListProductsUseCaseResponse {
  products: Product[]
}

export class ListProductsUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    coupleId,
  }: ListProductsUseCaseRequest): Promise<ListProductsUseCaseResponse> {
    const products = await this.productsRepository.listByCouple(coupleId)

    return { products }
  }
}
