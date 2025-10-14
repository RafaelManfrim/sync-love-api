import { prisma } from '@/lib/prisma'
import { PurchasesRepository } from '@/repositories/purchases-repository'
import { ShoppingItemsRepository } from '@/repositories/shopping-items-repository'
import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'
import { Purchase } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { ShoppingListAlreadyClosedError } from './errors/shopping-list-already-closed-error'
import { UnauthorizedError } from './errors/unauthorized-error'

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
  purchase: Purchase
}

export class CloseShoppingListUseCase {
  constructor(
    private shoppingListsRepository: ShoppingListsRepository,
    private shoppingItemsRepository: ShoppingItemsRepository,
    private purchasesRepository: PurchasesRepository,
  ) {}

  async execute({
    shoppingListId,
    userId,
    coupleId,
    items,
  }: CloseShoppingListUseCaseRequest): Promise<CloseShoppingListUseCaseResponse> {
    // 1. Validar a Lista de Compras
    const shoppingList =
      await this.shoppingListsRepository.findById(shoppingListId)

    if (!shoppingList) {
      throw new ResourceNotFoundError()
    }
    if (shoppingList.couple_id !== coupleId) {
      throw new UnauthorizedError()
    }
    if (shoppingList.finished_at) {
      throw new ShoppingListAlreadyClosedError()
    }

    // 2. Validar os Itens
    const shoppingItemIds = items.map((item) => item.shoppingItemId)
    const itemsFromDb =
      await this.shoppingItemsRepository.findManyByIds(shoppingItemIds)

    if (itemsFromDb.length !== items.length) {
      throw new ResourceNotFoundError() // Um ou mais itens não foram encontrados
    }

    // 3. Calcular o total e preparar os itens da compra
    let totalPurchase = 0
    const purchaseItemsToCreate = items.map((item) => {
      const dbItem = itemsFromDb.find((db) => db.id === item.shoppingItemId)
      if (!dbItem || dbItem.shopping_list_id !== shoppingListId) {
        throw new UnauthorizedError() // Item não pertence à lista
      }
      if (!dbItem.checked_at) {
        throw new Error('Cannot close a list with unchecked items.')
      }

      const itemTotal = item.unitPrice * dbItem.quantity
      totalPurchase += itemTotal

      return {
        item_id: dbItem.item_id,
        quantity: dbItem.quantity,
        price: item.unitPrice,
        total: itemTotal,
      }
    })

    // 4. Executar a Transação
    const purchase = await prisma.$transaction(async (tx) => {
      // Criar a Compra (Purchase)
      const createdPurchase = await tx.purchase.create({
        data: {
          shopping_list_id: shoppingListId,
          total: totalPurchase,
          payer_id: userId,
        },
      })

      // Criar os Itens da Compra (PurchaseItem)
      await tx.purchaseItem.createMany({
        data: purchaseItemsToCreate.map((item) => ({
          ...item,
          purchase_id: createdPurchase.id,
        })),
      })

      // Atualizar a Lista de Compras (ShoppingList)
      await tx.shoppingList.update({
        where: { id: shoppingListId },
        data: {
          finished_at: new Date(),
        },
      })

      return createdPurchase
    })

    return { purchase }
  }
}
