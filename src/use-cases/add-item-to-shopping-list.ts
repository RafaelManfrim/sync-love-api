import { ProductsRepository } from '@/repositories/products-repository'
import { ShoppingListItemsRepository } from '@/repositories/shopping-list-items-repository'
import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'
import { ShoppingListItem } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { ShoppingListAlreadyClosedError } from './errors/shopping-list-already-closed-error'

interface AddItemToShoppingListUseCaseRequest {
  itemName: string
  shoppingListId: number
  userId: number
  coupleId: number
  unitOfMeasure?: 'QUANTITY' | 'WEIGHT'
  quantity?: number
}

interface AddItemToShoppingListUseCaseResponse {
  shoppingItem: ShoppingListItem
}

export class AddItemToShoppingListUseCase {
  constructor(
    private shoppingListsRepository: ShoppingListsRepository,
    private productsRepository: ProductsRepository,
    private shoppingListItemsRepository: ShoppingListItemsRepository,
  ) {}

  async execute({
    itemName,
    shoppingListId,
    userId,
    coupleId,
    unitOfMeasure,
    quantity,
  }: AddItemToShoppingListUseCaseRequest): Promise<AddItemToShoppingListUseCaseResponse> {
    const shoppingList =
      await this.shoppingListsRepository.findById(shoppingListId)

    if (!shoppingList) {
      throw new ResourceNotFoundError()
    }

    if (shoppingList.couple_id !== coupleId) {
      throw new UnauthorizedError()
    }

    if (shoppingList.closed_at) {
      throw new ShoppingListAlreadyClosedError()
    }

    let product = await this.productsRepository.findByName(itemName)

    if (!product) {
      product = await this.productsRepository.create({
        name: itemName,
        unit_of_measure: unitOfMeasure || 'QUANTITY',
        couple_id: coupleId,
      })
    }

    const shoppingItem = await this.shoppingListItemsRepository.create({
      shopping_list_id: shoppingListId,
      product_id: product.id,
      author_id: userId,
      quantity: quantity || 1,
    })

    return { shoppingItem }
  }
}
