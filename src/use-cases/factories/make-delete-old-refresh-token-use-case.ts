import { DeleteOldRefreshTokenUseCase } from '../delete-old-refresh-token'
import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'

export function makeDeleteOldRefreshTokenUseCase() {
  const tokensRepository = new PrismaTokensRepository()
  const deleteOldRefreshTokenUseCase = new DeleteOldRefreshTokenUseCase(
    tokensRepository,
  )

  return deleteOldRefreshTokenUseCase
}
