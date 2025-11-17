import { beforeEach, describe, expect, it } from 'vitest'
import { DeleteOldRefreshTokenUseCase } from './delete-old-refresh-token'
import { InMemoryTokensRepository } from '@/repositories/in-memory/in-memory-tokens-repository'

let tokensRepository: InMemoryTokensRepository
let sut: DeleteOldRefreshTokenUseCase

describe('Delete Old Refresh Token Use Case', () => {
  beforeEach(() => {
    tokensRepository = new InMemoryTokensRepository()
    sut = new DeleteOldRefreshTokenUseCase(tokensRepository)
  })

  it('should be able to delete all refresh tokens for a user', async () => {
    await tokensRepository.create({
      user_id: 1,
      token: 'token-1',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    await tokensRepository.create({
      user_id: 1,
      token: 'token-2',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    await tokensRepository.create({
      user_id: 2,
      token: 'token-3',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    expect(tokensRepository.items).toHaveLength(3)

    const { deletedTokens } = await sut.execute({
      userId: 1,
    })

    expect(deletedTokens.count).toBe(2)
    expect(tokensRepository.items).toHaveLength(1)
    expect(tokensRepository.items[0].user_id).toBe(2)
  })

  it('should return count 0 if user has no tokens', async () => {
    const { deletedTokens } = await sut.execute({
      userId: 999,
    })

    expect(deletedTokens.count).toBe(0)
  })

  it('should not delete tokens from other users', async () => {
    await tokensRepository.create({
      user_id: 1,
      token: 'token-1',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    await tokensRepository.create({
      user_id: 2,
      token: 'token-2',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    await sut.execute({
      userId: 1,
    })

    expect(tokensRepository.items).toHaveLength(1)
    expect(tokensRepository.items[0].user_id).toBe(2)
  })
})
