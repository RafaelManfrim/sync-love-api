import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { PrismaCoupleInvitesRepository } from '@/repositories/prisma/prisma-couple-invites-repository'
import { ListInvitationsUseCase } from '../list-invitations'

export function makeListInvitationsUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const coupleInvitesRepository = new PrismaCoupleInvitesRepository()
  const listInvitationsUseCase = new ListInvitationsUseCase(
    usersRepository,
    coupleInvitesRepository,
  )

  return listInvitationsUseCase
}
