import { beforeEach, describe, expect, test } from 'vitest'

import { AuthenticateUseCase } from './authenticate'

import { InMemoryUsersRepository } from '@repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

describe('Authenticate Use Case', async () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })

  test('if user should be able to authenticate', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password', 8),
      gender: 'MALE',
    })

    const { user } = await sut.execute({
      email: 'john@doe.com',
      password: 'password',
    })

    expect(user.id).toEqual(expect.any(Number))
  })

  test('if user should not be able to authenticate with wrong email', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password', 8),
      gender: 'MALE',
    })

    await expect(() =>
      sut.execute({
        email: 'mary@jane.com',
        password: 'password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  test('if user should not be able to authenticate with wrong password', async () => {
    await usersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      password_hash: await hash('password', 8),
      gender: 'MALE',
    })

    await expect(() =>
      sut.execute({
        email: 'john@doe.com',
        password: 'password2',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
