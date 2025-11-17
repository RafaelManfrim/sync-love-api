import { CoupleInvite, Prisma } from '@prisma/client'
import { CoupleInvitesRepository } from '../couple-invites-repository'

export class InMemoryCoupleInvitesRepository
  implements CoupleInvitesRepository
{
  public items: CoupleInvite[] = []

  async listByUserId(userId: number) {
    return this.items.filter((item) => item.inviter_id === userId)
  }

  async listByInviteeEmail(email: string) {
    return this.items.filter((item) => item.invitee_email === email)
  }

  async findById(id: number) {
    const invite = this.items.find((item) => item.id === id)

    return invite || null
  }

  async findByInviterIdAndInviteeEmail(
    inviterId: number,
    inviteeEmail: string,
  ) {
    const invite = this.items.find(
      (item) =>
        item.inviter_id === inviterId && item.invitee_email === inviteeEmail,
    )

    return invite || null
  }

  async create(data: Prisma.CoupleInviteUncheckedCreateInput) {
    const invite: CoupleInvite = {
      id: this.items.length + 1,
      inviter_id: data.inviter_id,
      invitee_email: data.invitee_email,
      invited_at: new Date(),
      accepted_at: data.accepted_at ? new Date(data.accepted_at as Date) : null,
      rejected_at: data.rejected_at ? new Date(data.rejected_at as Date) : null,
    }

    this.items.push(invite)

    return invite
  }

  async acceptById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Invite not found')
    }

    this.items[index].accepted_at = new Date()

    return this.items[index]
  }

  async declineById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Invite not found')
    }

    this.items[index].rejected_at = new Date()

    return this.items[index]
  }

  async deleteById(id: number) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }
}
