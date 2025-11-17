import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RefreshTokenUseCase } from './refresh-token'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InMemoryTokensRepository } from '@/repositories/in-memory/in-memory-tokens-repository'
import { hash } from 'bcryptjs'
import { UserNotFoundError } from './errors/user-not-found-error'
import { RefreshTokenNotFoundError } from './errors/refresh-token-not-found-error'
import { RefreshTokenExpiredError } from './errors/refresh-token-expired-error'

// Mock das funções de JWT
vi.mock('@/utils/decode-jwt', () => ({
  decodeJWT: vi.fn(),
}))

vi.mock('@/utils/generate-tokens-jwt', () => ({
  generateTokensJWT: vi.fn(),
}))

let usersRepository: InMemoryUsersRepository
let tokensRepository: InMemoryTokensRepository
let sut: RefreshTokenUseCase

describe('Refresh Token Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    tokensRepository = new InMemoryTokensRepository()
    sut = new RefreshTokenUseCase(usersRepository, tokensRepository)
  })

  it('should be able to refresh tokens', async () => {
    const { decodeJWT } = await import('@/utils/decode-jwt')
    const { generateTokensJWT } = await import('@/utils/generate-tokens-jwt')

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await tokensRepository.create({
      user_id: user.id,
      token: 'old-refresh-token',
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    })

    vi.mocked(decodeJWT).mockResolvedValueOnce({ sub: user.id })
    vi.mocked(generateTokensJWT).mockResolvedValueOnce({
      access: 'new-access-token',
      refresh: 'new-refresh-token',
    })

    const mockReply = {} as any

    const { access, refresh } = await sut.execute({
      oldToken: 'old-refresh-token',
      reply: mockReply,
    })

    expect(access).toBe('new-access-token')
    expect(refresh).toBe('new-refresh-token')

    const newToken = await tokensRepository.findByUserId(user.id)
    expect(newToken?.token).toBe('new-refresh-token')
  })

  it('should not be able to refresh if user does not exist', async () => {
    const { decodeJWT } = await import('@/utils/decode-jwt')

    vi.mocked(decodeJWT).mockResolvedValueOnce({ sub: 999 })

    const mockReply = {} as any

    await expect(() =>
      sut.execute({
        oldToken: 'some-token',
        reply: mockReply,
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError)
  })

  it('should not be able to refresh if token is not in database', async () => {
    const { decodeJWT } = await import('@/utils/decode-jwt')

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    vi.mocked(decodeJWT).mockResolvedValueOnce({ sub: user.id })

    const mockReply = {} as any

    await expect(() =>
      sut.execute({
        oldToken: 'some-token',
        reply: mockReply,
      }),
    ).rejects.toBeInstanceOf(RefreshTokenNotFoundError)
  })

  it('should not be able to refresh if token is expired', async () => {
    const { decodeJWT } = await import('@/utils/decode-jwt')

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    await tokensRepository.create({
      user_id: user.id,
      token: 'expired-token',
      expires_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    })

    vi.mocked(decodeJWT).mockResolvedValueOnce({ sub: user.id })

    const mockReply = {} as any

    await expect(() =>
      sut.execute({
        oldToken: 'expired-token',
        reply: mockReply,
      }),
    ).rejects.toBeInstanceOf(RefreshTokenExpiredError)
  })

  it('should delete old token and create new one', async () => {
    const { decodeJWT } = await import('@/utils/decode-jwt')
    const { generateTokensJWT } = await import('@/utils/generate-tokens-jwt')

    const user = await usersRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password_hash: await hash('123456', 6),
    })

    const oldToken = await tokensRepository.create({
      user_id: user.id,
      token: 'old-token',
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    })

    vi.mocked(decodeJWT).mockResolvedValueOnce({ sub: user.id })
    vi.mocked(generateTokensJWT).mockResolvedValueOnce({
      access: 'new-access',
      refresh: 'new-refresh',
    })

    const mockReply = {} as any

    await sut.execute({
      oldToken: 'old-token',
      reply: mockReply,
    })

    const newToken = await tokensRepository.findByUserId(user.id)
    expect(newToken?.token).not.toBe(oldToken.token)
    expect(newToken?.token).toBe('new-refresh')
  })
})
