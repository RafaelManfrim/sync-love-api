import { PrismaShoppingListsRepository } from '@/repositories/prisma/prisma-shopping-lists-repository'
import { AddItemToShoppingListUseCase } from '../add-item-to-shopping-list'
import { PrismaProductsRepository } from '@/repositories/prisma/prisma-products-repository'
import { PrismaShoppingListItemsRepository } from '@/repositories/prisma/prisma-shopping-list-items-repository'

export function makeAddItemToShoppingListUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const productsRepository = new PrismaProductsRepository()
  const shoppingListItemsRepository = new PrismaShoppingListItemsRepository()

  const useCase = new AddItemToShoppingListUseCase(
    shoppingListsRepository,
    productsRepository,
    shoppingListItemsRepository,
  )

  return useCase
}
