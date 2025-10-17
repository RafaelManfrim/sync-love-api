import { ShoppingListItem } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { ShoppingListItemsRepository } from '@/repositories/shopping-list-items-repository'
import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'

interface ToggleShoppingItemCheckUseCaseRequest {
  shoppingItemId: number
  coupleId: number
  listId: number
}

interface ToggleShoppingItemCheckUseCaseResponse {
  shoppingItem: ShoppingListItem
}

export class ToggleShoppingItemCheckUseCase {
  constructor(
    private shoppingListsRepository: ShoppingListsRepository,
    private shoppingItemsRepository: ShoppingListItemsRepository,
  ) {}

  async execute({
    shoppingItemId,
    coupleId,
    listId,
  }: ToggleShoppingItemCheckUseCaseRequest): Promise<ToggleShoppingItemCheckUseCaseResponse> {
    const shoppingItem =
      await this.shoppingItemsRepository.findById(shoppingItemId)

    if (!shoppingItem) {
      throw new ResourceNotFoundError()
    }

    const shoppingList = await this.shoppingListsRepository.findById(listId)

    if (!shoppingList) {
      throw new ResourceNotFoundError()
    }

    if (shoppingList.couple_id !== coupleId) {
      throw new UnauthorizedError()
    }

    if (shoppingItem.shopping_list_id !== shoppingList.id) {
      throw new ResourceNotFoundError()
    }

    const isChecked = !!shoppingItem.is_checked

    shoppingItem.is_checked = !isChecked

    const updatedShoppingItem =
      await this.shoppingItemsRepository.save(shoppingItem)

    return { shoppingItem: updatedShoppingItem }
  }
}
