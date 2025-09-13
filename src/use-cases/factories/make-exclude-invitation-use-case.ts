import { PrismaCoupleInvitesRepository } from '@/repositories/prisma/prisma-couple-invites-repository'
import { ExcludeInvitationUseCase } from '../exclude-invitation'

export function makeExcludeInvitationUseCase() {
  const coupleInvitesRepository = new PrismaCoupleInvitesRepository()
  const excludeInvitationUseCase = new ExcludeInvitationUseCase(
    coupleInvitesRepository,
  )

  return excludeInvitationUseCase
}
