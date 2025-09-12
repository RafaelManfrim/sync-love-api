import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { CreateInvitationUseCase } from '../create-invitation'
import { PrismaCoupleInvitesRepository } from '@/repositories/prisma/prisma-couple-invites-repository'

export function makeCreateInvitationUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const coupleInvitesRepository = new PrismaCoupleInvitesRepository()
  const createInvitationUseCase = new CreateInvitationUseCase(
    usersRepository,
    coupleInvitesRepository,
  )

  return createInvitationUseCase
}
