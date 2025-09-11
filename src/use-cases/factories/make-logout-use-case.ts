import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { LogoutUseCase } from '../logout'
import { PrismaTokensRepository } from '@/repositories/prisma/prisma-tokens-repository'

export function makeLogoutUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const tokensRepository = new PrismaTokensRepository()
  const logoutUseCase = new LogoutUseCase(usersRepository, tokensRepository)

  return logoutUseCase
}
