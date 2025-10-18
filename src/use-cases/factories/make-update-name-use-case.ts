import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UpdateNameUseCase } from '../update-name'

export function makeUpdateNameUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateNameUseCase(usersRepository)

  return useCase
}
