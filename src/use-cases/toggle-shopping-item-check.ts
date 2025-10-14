import { ShoppingListItem } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { ShoppingListItemsRepository } from '@/repositories/shopping-list-items-repository'

interface ToggleShoppingItemCheckUseCaseRequest {
  shoppingItemId: number
  userId: number
  coupleId: number
}

interface ToggleShoppingItemCheckUseCaseResponse {
  shoppingItem: ShoppingListItem
}

export class ToggleShoppingItemCheckUseCase {
  constructor(private shoppingItemsRepository: ShoppingListItemsRepository) {}

  async execute({
    shoppingItemId,
    userId,
    coupleId,
  }: ToggleShoppingItemCheckUseCaseRequest): Promise<ToggleShoppingItemCheckUseCaseResponse> {
    // O findById agora inclui a shopping_list
    const shoppingItem =
      await this.shoppingItemsRepository.findById(shoppingItemId)

    if (!shoppingItem) {
      throw new ResourceNotFoundError()
    }

    // Verificação de segurança
    if (shoppingItem.shopping_list.couple_id !== coupleId) {
      throw new UnauthorizedError()
    }

    const isChecked = !!shoppingItem.checked_at

    if (isChecked) {
      // Desmarcar
      shoppingItem.checked_at = null
      shoppingItem.checked_by = null
    } else {
      // Marcar
      shoppingItem.checked_at = new Date()
      shoppingItem.checked_by = userId
    }

    const updatedShoppingItem =
      await this.shoppingItemsRepository.save(shoppingItem)

    return { shoppingItem: updatedShoppingItem }
  }
}
