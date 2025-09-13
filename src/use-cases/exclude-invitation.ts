import { CoupleInvitesRepository } from '@/repositories/couple-invites-repository'
import { InvitationNotFoundError } from './errors/invitation-not-found-error'

interface ExcludeInvitationUseCaseRequest {
  id: number
  userId: number
}

export class ExcludeInvitationUseCase {
  constructor(private coupleInvitesRepository: CoupleInvitesRepository) {}

  async execute({
    id,
    userId,
  }: ExcludeInvitationUseCaseRequest): Promise<void> {
    const invite = await this.coupleInvitesRepository.findById(id)

    if (!invite || invite.inviter_id !== userId) {
      throw new InvitationNotFoundError()
    }

    await this.coupleInvitesRepository.deleteById(id)
  }
}
