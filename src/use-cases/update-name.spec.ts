import { beforeEach, describe, expect, it } from 'vitest'
import { UpdateNameUseCase } from './update-name'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let usersRepository: InMemoryUsersRepository
let sut: UpdateNameUseCase

describe('Update Name Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateNameUseCase(usersRepository)
  })

  it('should be able to update user name', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await sut.execute({
      userId: user.id,
      newName: 'Jane Doe',
    })

    const updatedUser = await usersRepository.findById(user.id)

    expect(updatedUser?.name).toBe('Jane Doe')
  })

  it('should not be able to update name if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        newName: 'Jane Doe',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
