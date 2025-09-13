import { CoupleInvitesRepository } from '@/repositories/couple-invites-repository'
import { InvitationNotFoundError } from './errors/invitation-not-found-error'
import { UsersRepository } from '@/repositories/users-repository'
import { UserNotFoundError } from './errors/user-not-found-error'
import { InvitationAlreadyRejectedError } from './errors/invitation-already-rejected-error'
import { InvitationAlreadyAcceptedError } from './errors/invitation-already-accepted-error'

interface DeclineInvitationUseCaseRequest {
  id: number
  userId: number
}

export class DeclineInvitationUseCase {
  constructor(
    private coupleInvitesRepository: CoupleInvitesRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    id,
    userId,
  }: DeclineInvitationUseCaseRequest): Promise<void> {
    const invite = await this.coupleInvitesRepository.findById(id)

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    if (!invite || invite.invitee_email !== user.email) {
      throw new InvitationNotFoundError()
    }

    if (invite.rejected_at) {
      throw new InvitationAlreadyRejectedError()
    }

    if (invite.accepted_at) {
      throw new InvitationAlreadyAcceptedError()
    }

    await this.coupleInvitesRepository.declineById(id)
  }
}
