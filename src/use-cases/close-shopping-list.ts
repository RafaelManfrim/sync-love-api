import { prisma } from '@/lib/prisma'
import { ShoppingListItemsRepository } from '@/repositories/shopping-list-items-repository'
import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ShoppingListAlreadyClosedError } from './errors/shopping-list-already-closed-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { Decimal } from '@prisma/client/runtime/library'
import { ShoppingList } from '@prisma/client'

interface CloseShoppingListUseCaseRequest {
  shoppingListId: number
  userId: number
  coupleId: number
  items: Array<{
    shoppingItemId: number
    unitPrice: number
  }>
}

interface CloseShoppingListUseCaseResponse {
  closedList: ShoppingList
}

export class CloseShoppingListUseCase {
  constructor(
    private shoppingListsRepository: ShoppingListsRepository,
    private shoppingListItemsRepository: ShoppingListItemsRepository,
  ) {}

  async execute({
    shoppingListId,
    coupleId,
    items,
  }: CloseShoppingListUseCaseRequest): Promise<CloseShoppingListUseCaseResponse> {
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

    const boughtItemsId = items.map((item) => item.shoppingItemId)

    const itemsFromDb =
      await this.shoppingListItemsRepository.findManyByIds(boughtItemsId)

    if (itemsFromDb.length !== items.length) {
      throw new ResourceNotFoundError() // Um ou mais itens não foram encontrados
    }

    const closedList = await prisma.$transaction(async (tx) => {
      const updatedItems = itemsFromDb.map((item) => {
        const boughtItem = items.find((i) => i.shoppingItemId === item.id)

        item.unit_price = new Decimal(boughtItem?.unitPrice || 0)
        return item
      })

      await Promise.all(
        updatedItems.map((item) =>
          tx.shoppingListItem.update({
            where: { id: item.id },
            data: {
              unit_price: item.unit_price,
            },
          }),
        ),
      )

      const closedList = await tx.shoppingList.update({
        where: { id: shoppingListId },
        data: {
          closed_at: new Date(),
        },
      })

      return closedList
    })

    return { closedList }
  }
}
