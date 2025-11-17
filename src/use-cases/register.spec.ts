import { beforeEach, describe, expect, test } from 'vitest'
import { compare } from 'bcryptjs'

import { RegisterUseCase } from './register'
import { InMemoryUsersRepository } from '@repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  test('should be able to register a new user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      gender: 'MALE',
    })

    expect(user.id).toEqual(expect.any(Number))
    expect(user.email).toBe('john@doe.com')
    expect(user.name).toBe('John Doe')
    expect(user.gender).toBe('MALE')
  })

  test('should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      gender: 'MALE',
    })

    const isPasswordCorrectlyHashed = await compare(
      'password123',
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  test('should not be able to register with an existing email', async () => {
    const email = 'john@doe.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: 'password123',
      gender: 'MALE',
    })

    await expect(() =>
      sut.execute({
        name: 'Jane Doe',
        email,
        password: 'password456',
        gender: 'FEMALE',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  test('should set default values for optional fields', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      gender: 'MALE',
    })

    expect(user.is_admin).toBe(false)
    expect(user.is_premium).toBe(false)
    expect(user.avatar_url).toBeNull()
    expect(user.couple_id).toBeNull()
  })

  test('should create user with FEMALE gender', async () => {
    const { user } = await sut.execute({
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password: 'password123',
      gender: 'FEMALE',
    })

    expect(user.gender).toBe('FEMALE')
    expect(user.id).toEqual(expect.any(Number))
  })

  test('should create user with correct timestamps', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'password123',
      gender: 'MALE',
    })

    expect(user.created_at).toBeInstanceOf(Date)
    expect(user.updated_at).toBeInstanceOf(Date)
  })
})
