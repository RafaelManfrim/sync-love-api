import { TokensRepository } from '@/repositories/tokens-repository'
import { UserRefreshToken } from '@prisma/client'

interface CreateRefreshTokenUseCaseRequest {
  userId: number
  token: string
}

interface CreateRefreshTokenUseCaseResponse {
  createdToken: UserRefreshToken
}

export class CreateRefreshTokenUseCase {
  constructor(private tokensRepository: TokensRepository) {}

  async execute({
    userId,
    token,
  }: CreateRefreshTokenUseCaseRequest): Promise<CreateRefreshTokenUseCaseResponse> {
    const createdToken = await this.tokensRepository.create({
      user_id: userId,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    return {
      createdToken,
    }
  }
}
