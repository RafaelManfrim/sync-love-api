import { ShoppingListsRepository } from '@/repositories/shopping-lists-repository'
import { ShoppingList } from '@prisma/client'

interface CreateShoppingListUseCaseRequest {
  title: string
  coupleId: number
  authorId: number
}

interface CreateShoppingListUseCaseResponse {
  shoppingList: ShoppingList
}

export class CreateShoppingListUseCase {
  constructor(private shoppingListsRepository: ShoppingListsRepository) {}

  async execute({
    title,
    coupleId,
    authorId,
  }: CreateShoppingListUseCaseRequest): Promise<CreateShoppingListUseCaseResponse> {
    const shoppingList = await this.shoppingListsRepository.create({
      name: title,
      couple_id: coupleId,
      author_id: authorId,
    })

    return { shoppingList }
  }
}
