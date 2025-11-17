import { beforeEach, describe, expect, it } from 'vitest'
import { UpdatePasswordUseCase } from './update-password'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { hash, compare } from 'bcryptjs'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository
let sut: UpdatePasswordUseCase

describe('Update Password Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdatePasswordUseCase(usersRepository)
  })

  it('should be able to update user password', async () => {
    const oldPassword = '123456'
    const newPassword = 'newpassword123'

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash(oldPassword, 6),
    })

    await sut.execute({
      userId: user.id,
      oldPassword,
      newPassword,
    })

    const updatedUser = await usersRepository.findById(user.id)

    const doesNewPasswordMatch = await compare(
      newPassword,
      updatedUser!.password_hash,
    )

    expect(doesNewPasswordMatch).toBe(true)
  })

  it('should not be able to update password if user does not exist', async () => {
    await expect(() =>
      sut.execute({
        userId: 999,
        oldPassword: '123456',
        newPassword: 'newpassword123',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to update password if old password is wrong', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(() =>
      sut.execute({
        userId: user.id,
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not change password if old and new passwords are not provided', async () => {
    const originalPassword = await hash('123456', 6)

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: originalPassword,
    })

    await sut.execute({
      userId: user.id,
    })

    const updatedUser = await usersRepository.findById(user.id)

    expect(updatedUser!.password_hash).toBe(originalPassword)
  })
})
