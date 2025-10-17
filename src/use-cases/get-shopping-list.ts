import { ShoppingList } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'

interface GetShoppingListUseCaseRequest {
  listId: number
  coupleId: number
}

interface GetShoppingListUseCaseResponse {
  shoppingList: ShoppingList
}

export class GetShoppingListUseCase {
  constructor(private shoppingListsRepository: ShoppingListsRepository) {}

  async execute({
    listId,
    coupleId,
  }: GetShoppingListUseCaseRequest): Promise<GetShoppingListUseCaseResponse> {
    const shoppingList = await this.shoppingListsRepository.findById(listId)

    if (!shoppingList) {
      throw new ResourceNotFoundError()
    }

    if (shoppingList.couple_id !== coupleId) {
      throw new UnauthorizedError()
    }

    return { shoppingList }
  }
}
