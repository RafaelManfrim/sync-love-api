import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteShoppingListUseCase } from './delete-shopping-list'
import { InMemoryShoppingListsRepository } from '@/repositories/in-memory/in-memory-shopping-lists-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'

let shoppingListsRepository: InMemoryShoppingListsRepository
let usersRepository: InMemoryUsersRepository
let sut: DeleteShoppingListUseCase

describe('Delete Shopping List Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteShoppingListUseCase(
      shoppingListsRepository,
      usersRepository,
    )
  })

  it('should be able to delete a shopping list', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const list = await shoppingListsRepository.create({
      couple_id: 1,
      created_by_user_id: user.id,
      title: 'Weekly Groceries',
    })

    expect(shoppingListsRepository.items).toHaveLength(1)

    await sut.execute({
      userId: user.id,
      listId: list.id,
    })

    expect(shoppingListsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a list if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        listId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a list if user does not have a couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: null,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        listId: 1,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a list that does not exist', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        listId: 999,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a list from another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const list = await shoppingListsRepository.create({
      couple_id: 2, // Different couple
      created_by_user_id: 2,
      title: 'Weekly Groceries',
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        listId: list.id,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })
})
