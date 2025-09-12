import { UsersRepository } from '@/repositories/users-repository'
import { TokensRepository } from '@/repositories/tokens-repository'
import { decodeJWT } from '@/utils/decode-jwt'
import { UserNotFoundError } from './errors/user-not-found-error'
import { RefreshTokenNotFoundError } from './errors/refresh-token-not-found-error'
import { RefreshTokenExpiredError } from './errors/refresh-token-expired-error'
import { generateTokensJWT } from '@/utils/generate-tokens-jwt'
import { FastifyReply } from 'fastify'

interface RefreshTokenUseCaseRequest {
  oldToken: string
  reply: FastifyReply
}

interface RefreshTokenUseCaseResponse {
  access: string
  refresh: string
}

export class RefreshTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokensRepository: TokensRepository,
  ) {}

  async execute({
    oldToken,
    reply,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const data = await decodeJWT(oldToken)

    const user = await this.usersRepository.findById(data.sub)

    if (!user) {
      throw new UserNotFoundError()
    }

    const refreshTokenInDb = await this.tokensRepository.findByUserId(user.id)

    if (!refreshTokenInDb) {
      throw new RefreshTokenNotFoundError()
    }

    const currentDate = new Date()

    if (currentDate > new Date(refreshTokenInDb.expires_at)) {
      throw new RefreshTokenExpiredError()
    }

    const { access, refresh } = await generateTokensJWT(user, reply)

    await this.tokensRepository.deleteByUserId(user.id)

    await this.tokensRepository.create({
      user_id: user.id,
      token: refresh,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    return { access, refresh }
  }
}
