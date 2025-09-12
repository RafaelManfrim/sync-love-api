import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { RefreshTokenUseCase } from '../refresh-token'
import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'

export function makeRefreshTokenUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const tokensRepository = new PrismaTokensRepository()
  const refreshTokenUseCase = new RefreshTokenUseCase(
    usersRepository,
    tokensRepository,
  )

  return refreshTokenUseCase
}
