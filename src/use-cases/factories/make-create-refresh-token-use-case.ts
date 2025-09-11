import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'
import { CreateRefreshTokenUseCase } from '../create-refresh-token'

export function makeCreateRefreshTokenUseCase() {
  const tokensRepository = new PrismaTokensRepository()
  const createRefreshTokenUseCase = new CreateRefreshTokenUseCase(
    tokensRepository,
  )

  return createRefreshTokenUseCase
}
