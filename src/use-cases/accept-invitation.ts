import { CoupleInvitesRepository } from '@/repositories/couple-invites-repository'
import { InvitationNotFoundError } from './errors/invitation-not-found-error'
import { UsersRepository } from '@/repositories/users-repository'
import { UserNotFoundError } from './errors/user-not-found-error'
import { CouplesRepository } from '@/repositories/couples-repository'
import { Couple } from '@prisma/client'
import { InvitationAlreadyRejectedError } from './errors/invitation-already-rejected-error'
import { InvitationAlreadyAcceptedError } from './errors/invitation-already-accepted-error'

interface AcceptInvitationUseCaseRequest {
  id: number
  userId: number
}

interface AcceptInvitationUseCaseResponse {
  couple: Couple
}

export class AcceptInvitationUseCase {
  constructor(
    private coupleInvitesRepository: CoupleInvitesRepository,
    private usersRepository: UsersRepository,
    private couplesRepository: CouplesRepository,
  ) {}

  async execute({
    id,
    userId,
  }: AcceptInvitationUseCaseRequest): Promise<AcceptInvitationUseCaseResponse> {
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

    const acceptedInvite = await this.coupleInvitesRepository.acceptById(id)

    const couple = await this.couplesRepository.create({
      invite_id: acceptedInvite.id,
      invitee_id: userId,
      inviter_id: acceptedInvite.inviter_id,
    })

    await this.usersRepository.update(userId, {
      couple: {
        connect: {
          id: couple.id,
        },
      },
    })

    await this.usersRepository.update(acceptedInvite.inviter_id, {
      couple: {
        connect: {
          id: couple.id,
        },
      },
    })

    return {
      couple,
    }
  }
}
