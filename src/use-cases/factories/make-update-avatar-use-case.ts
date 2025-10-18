import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UpdateAvatarUseCase } from '../update-avatar'

export function makeUpdateAvatarUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const useCase = new UpdateAvatarUseCase(usersRepository)
  return useCase
}
