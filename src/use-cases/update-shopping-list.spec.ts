import { beforeEach, describe, expect, it } from 'vitest'
import { UpdateShoppingListUseCase } from './update-shopping-list'
import { InMemoryShoppingListsRepository } from '@/repositories/in-memory/in-memory-shopping-lists-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { ShoppingListAlreadyClosedError } from './errors/shopping-list-already-closed-error'

let shoppingListsRepository: InMemoryShoppingListsRepository
let usersRepository: InMemoryUsersRepository
let sut: UpdateShoppingListUseCase

describe('Update Shopping List Use Case', () => {
  beforeEach(() => {
    shoppingListsRepository = new InMemoryShoppingListsRepository()
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateShoppingListUseCase(
      shoppingListsRepository,
      usersRepository,
    )
  })

  it('should be able to update a shopping list name', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const shoppingList = await shoppingListsRepository.create({
      author_id: user.id,
      couple_id: 1,
      name: 'Weekly Groceries',
    })

    const { shoppingList: updatedList } = await sut.execute({
      userId: user.id,
      listId: shoppingList.id,
      name: 'Monthly Groceries',
    })

    expect(updatedList.name).toBe('Monthly Groceries')
  })

  it('should not be able to update a list if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        listId: 1,
        name: 'New name',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a list if user does not have a couple', async () => {
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
        name: 'New name',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a list that does not exist', async () => {
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
        name: 'New name',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update a list from another couple', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const shoppingList = await shoppingListsRepository.create({
      author_id: 2,
      couple_id: 2,
      name: 'Weekly Groceries',
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        listId: shoppingList.id,
        name: 'New name',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should not be able to update a closed shopping list', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
      couple_id: 1,
    })

    const shoppingList = await shoppingListsRepository.create({
      author_id: user.id,
      couple_id: 1,
      name: 'Weekly Groceries',
      closed_at: new Date(),
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        listId: shoppingList.id,
        name: 'New name',
      }),
    ).rejects.toBeInstanceOf(ShoppingListAlreadyClosedError)
  })
})
