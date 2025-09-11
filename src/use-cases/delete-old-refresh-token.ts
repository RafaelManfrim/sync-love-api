import { TokensRepository } from '@/repositories/tokens-repository'
import { Prisma } from '@prisma/client'

interface DeleteOldRefreshTokenUseCaseRequest {
  userId: number
}

interface DeleteOldRefreshTokenUseCaseResponse {
  deletedTokens: Prisma.BatchPayload
}

export class DeleteOldRefreshTokenUseCase {
  constructor(private tokensRepository: TokensRepository) {}

  async execute({
    userId,
  }: DeleteOldRefreshTokenUseCaseRequest): Promise<DeleteOldRefreshTokenUseCaseResponse> {
    const deletedTokens = await this.tokensRepository.deleteByUserId(userId)

    return {
      deletedTokens,
    }
  }
}
