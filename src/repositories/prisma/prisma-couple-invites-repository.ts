import { prisma } from '@/lib/prisma'
import { CoupleInvite, Prisma } from '@prisma/client'

import { CoupleInvitesRepository } from '../couple-invites-repository'

export class PrismaCoupleInvitesRepository implements CoupleInvitesRepository {
  create(data: Prisma.CoupleInviteUncheckedCreateInput): Promise<CoupleInvite> {
    return prisma.coupleInvite.create({
      data,
    })
  }

  async listByUserId(userId: number): Promise<CoupleInvite[]> {
    const invites = await prisma.coupleInvite.findMany({
      where: {
        inviter_id: userId,
      },
    })

    return invites
  }

  async listByInviteeEmail(email: string): Promise<CoupleInvite[]> {
    const invites = await prisma.coupleInvite.findMany({
      where: {
        invitee_email: email,
      },
      include: {
        inviter: {
          select: {
            email: true,
            name: true,
            gender: true,
            avatar_url: true,
          },
        },
      },
    })

    return invites
  }

  async declineById(id: number): Promise<void> {
    await prisma.coupleInvite.delete({
      where: {
        id,
      },
    })
  }
}
