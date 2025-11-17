import { beforeEach, describe, expect, it } from 'vitest'
import { CreateRefreshTokenUseCase } from './create-refresh-token'
import { InMemoryTokensRepository } from '@/repositories/in-memory/in-memory-tokens-repository'

let tokensRepository: InMemoryTokensRepository
let sut: CreateRefreshTokenUseCase

describe('Create Refresh Token Use Case', () => {
  beforeEach(() => {
    tokensRepository = new InMemoryTokensRepository()
    sut = new CreateRefreshTokenUseCase(tokensRepository)
  })

  it('should be able to create a refresh token', async () => {
    const { createdToken } = await sut.execute({
      userId: 1,
      token: 'valid-refresh-token-123',
    })

    expect(createdToken.id).toEqual(expect.any(Number))
    expect(createdToken.user_id).toBe(1)
    expect(createdToken.token).toBe('valid-refresh-token-123')
  })

  it('should set expiration to 7 days from now', async () => {
    const beforeExecution = Date.now()
    const { createdToken } = await sut.execute({
      userId: 1,
      token: 'valid-refresh-token-123',
    })
    const afterExecution = Date.now()

    const sevenDays = 7 * 24 * 60 * 60 * 1000

    expect(createdToken.expires_at.getTime()).toBeGreaterThanOrEqual(
      beforeExecution + sevenDays,
    )
    expect(createdToken.expires_at.getTime()).toBeLessThanOrEqual(
      afterExecution + sevenDays,
    )
  })

  it('should be able to create multiple refresh tokens for the same user', async () => {
    await sut.execute({
      userId: 1,
      token: 'first-token',
    })

    const { createdToken } = await sut.execute({
      userId: 1,
      token: 'second-token',
    })

    expect(createdToken.token).toBe('second-token')
    expect(tokensRepository.items).toHaveLength(2)
  })

  it('should store the token in the repository', async () => {
    await sut.execute({
      userId: 1,
      token: 'valid-refresh-token-123',
    })

    expect(tokensRepository.items[0].token).toBe('valid-refresh-token-123')
    expect(tokensRepository.items[0].user_id).toBe(1)
  })

  it('should set created_at timestamp', async () => {
    const { createdToken } = await sut.execute({
      userId: 1,
      token: 'valid-refresh-token-123',
    })

    expect(createdToken.created_at).toBeInstanceOf(Date)
    expect(createdToken.created_at.getTime()).toBeLessThanOrEqual(Date.now())
  })
})
