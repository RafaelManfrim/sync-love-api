import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'
import { ShoppingList } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { CouplesRepository } from '@/repositories/couples-repository'

interface ListCoupleShoppingListsUseCaseRequest {
  coupleId: number
}

interface ListCoupleShoppingListsUseCaseResponse {
  shoppingLists: ShoppingList[]
}

export class ListCoupleShoppingListsUseCase {
  constructor(
    private shoppingListsRepository: ShoppingListsRepository,
    private couplesRepository: CouplesRepository,
  ) {}

  async execute({
    coupleId,
  }: ListCoupleShoppingListsUseCaseRequest): Promise<ListCoupleShoppingListsUseCaseResponse> {
    const couple = await this.couplesRepository.findDetailsById(coupleId)

    if (!couple) {
      throw new ResourceNotFoundError()
    }

    const shoppingLists =
      await this.shoppingListsRepository.listByCoupleId(coupleId)

    if (!shoppingLists) {
      throw new ResourceNotFoundError()
    }

    return { shoppingLists }
  }
}
