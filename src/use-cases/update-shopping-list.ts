import { ShoppingListsRepository } from '@repositories/shopping-lists-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ShoppingList } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { ShoppingListAlreadyClosedError } from './errors/shopping-list-already-closed-error'

interface UpdateShoppingListUseCaseRequest {
  userId: number
  listId: number
  name: string
}

interface UpdateShoppingListUseCaseResponse {
  shoppingList: ShoppingList
}

export class UpdateShoppingListUseCase {
  constructor(
    private shoppingListsRepository: ShoppingListsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    listId,
    name,
  }: UpdateShoppingListUseCaseRequest): Promise<UpdateShoppingListUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    const list = await this.shoppingListsRepository.findById(listId)
    if (!list) {
      throw new ResourceNotFoundError()
    }

    if (list.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    // Regra de negócio: não pode editar lista fechada
    if (list.closed_at) {
      throw new ShoppingListAlreadyClosedError()
    }

    const shoppingList = await this.shoppingListsRepository.update(listId, {
      name,
    })

    return {
      shoppingList,
    }
  }
}
