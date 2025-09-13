import { PrismaCoupleInvitesRepository } from '@/repositories/prisma/prisma-couple-invites-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { PrismaCouplesRepository } from '@/repositories/prisma/prisma-couples-repository'
import { AcceptInvitationUseCase } from '../accept-invitation'

export function makeAcceptInvitationUseCase() {
  const coupleInvitesRepository = new PrismaCoupleInvitesRepository()
  const usersRepository = new PrismaUsersRepository()
  const couplesRepository = new PrismaCouplesRepository()
  const acceptInvitationUseCase = new AcceptInvitationUseCase(
    coupleInvitesRepository,
    usersRepository,
    couplesRepository,
  )

  return acceptInvitationUseCase
}
