import { beforeEach, describe, expect, it } from 'vitest'
import { UserDataUseCase } from './user-data'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { UserNotFoundError } from './errors/user-not-found-error'

let usersRepository: InMemoryUsersRepository
let sut: UserDataUseCase

describe('User Data Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UserDataUseCase(usersRepository)
  })

  it('should be able to get user data', async () => {
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await sut.execute({ userId: createdUser.id })

    expect(user.id).toBe(createdUser.id)
    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john@example.com')
  })

  it('should not be able to get data of non-existent user', async () => {
    await expect(() => sut.execute({ userId: 999 })).rejects.toBeInstanceOf(
      UserNotFoundError,
    )
  })
})
