import { ShoppingListsRepository } from '@repositories/shopping-lists-repository'
import { UsersRepository } from '@repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

interface DeleteShoppingListUseCaseRequest {
  userId: number
  listId: number
}

export class DeleteShoppingListUseCase {
  constructor(
    private shoppingListsRepository: ShoppingListsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    listId,
  }: DeleteShoppingListUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId)
    if (!user || !user.couple_id) {
      throw new ResourceNotFoundError()
    }

    // Validação de segurança: o usuário é dono da lista?
    const list = await this.shoppingListsRepository.findById(listId)
    if (!list) {
      throw new ResourceNotFoundError()
    }

    if (list.couple_id !== user.couple_id) {
      throw new UnauthorizedError()
    }

    // O repositório cuida da transação
    await this.shoppingListsRepository.deleteById(listId)
  }
}
