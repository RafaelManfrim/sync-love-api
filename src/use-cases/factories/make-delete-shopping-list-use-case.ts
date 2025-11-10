import { PrismaShoppingListsRepository } from '@repositories/prisma/prisma-shopping-lists-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { DeleteShoppingListUseCase } from '../delete-shopping-list'

export function makeDeleteShoppingListUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new DeleteShoppingListUseCase(
    shoppingListsRepository,
    usersRepository,
  )

  return useCase
}
