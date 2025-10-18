import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UpdatePasswordUseCase } from '../update-password'

export function makeUpdatePasswordUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdatePasswordUseCase(usersRepository)

  return useCase
}
