import { beforeEach, describe, expect, it } from 'vitest'
import { LogoutUseCase } from './logout'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryTokensRepository } from '@/repositories/in-memory/in-memory-tokens-repository'
import { hash } from 'bcryptjs'
import { UserNotFoundError } from './errors/user-not-found-error'

let usersRepository: InMemoryUsersRepository
let tokensRepository: InMemoryTokensRepository
let sut: LogoutUseCase

describe('Logout Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    tokensRepository = new InMemoryTokensRepository()
    sut = new LogoutUseCase(usersRepository, tokensRepository)
  })

  it('should be able to logout user and delete tokens', async () => {
    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await tokensRepository.create({
      user_id: user.id,
      token: 'refresh-token-1',
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })

    await tokensRepository.create({
      user_id: user.id,
      token: 'refresh-token-2',
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
    })

    const { user: loggedOutUser } = await sut.execute({ userId: user.id })

    expect(loggedOutUser.id).toBe(user.id)

    const remainingTokens = await tokensRepository.findByUserId(user.id)
    expect(remainingTokens).toBeNull()
  })

  it('should not be able to logout if user does not exist', async () => {
    await expect(() => sut.execute({ userId: 999 })).rejects.toBeInstanceOf(
      UserNotFoundError,
    )
  })
})
