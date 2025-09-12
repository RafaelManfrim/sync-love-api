import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UserDataUseCase } from '../user-data'

export function makeUserDataUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const userDataUseCase = new UserDataUseCase(usersRepository)

  return userDataUseCase
}
