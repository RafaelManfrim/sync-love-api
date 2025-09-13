import { PrismaCoupleInvitesRepository } from '@/repositories/prisma/prisma-couple-invites-repository'
import { DeclineInvitationUseCase } from '../decline-invitation'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'

export function makeDeclineInvitationUseCase() {
  const coupleInvitesRepository = new PrismaCoupleInvitesRepository()
  const usersRepository = new PrismaUsersRepository()
  const declineInvitationUseCase = new DeclineInvitationUseCase(
    coupleInvitesRepository,
    usersRepository,
  )

  return declineInvitationUseCase
}
