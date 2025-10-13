import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'
import { ShoppingList } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface ListCoupleShoppingListsUseCaseRequest {
  coupleId: number
}

interface ListCoupleShoppingListsUseCaseResponse {
  shoppingLists: ShoppingList[]
}

export class ListCoupleShoppingListsUseCase {
  constructor(private shoppingListsRepository: ShoppingListsRepository) {}

  async execute({
    coupleId,
  }: ListCoupleShoppingListsUseCaseRequest): Promise<ListCoupleShoppingListsUseCaseResponse> {
    const shoppingLists =
      await this.shoppingListsRepository.listByCoupleId(coupleId)

    if (!shoppingLists) {
      throw new ResourceNotFoundError()
    }

    return { shoppingLists }
  }
}
