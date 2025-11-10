import { PrismaShoppingListsRepository } from '@repositories/prisma/prisma-shopping-lists-repository'
import { PrismaUsersRepository } from '@repositories/prisma/prisma-users-repository'
import { UpdateShoppingListUseCase } from '../update-shopping-list'

export function makeUpdateShoppingListUseCase() {
  const shoppingListsRepository = new PrismaShoppingListsRepository()
  const usersRepository = new PrismaUsersRepository()

  const useCase = new UpdateShoppingListUseCase(
    shoppingListsRepository,
    usersRepository,
  )

  return useCase
}
