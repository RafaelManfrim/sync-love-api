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
        accepted_at: null,
        rejected_at: null,
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

  async findById(id: number): Promise<CoupleInvite | null> {
    const invite = await prisma.coupleInvite.findUnique({
      where: {
        id,
      },
    })

    return invite
  }

  async findByInviterIdAndInviteeEmail(
    inviterId: number,
    inviteeEmail: string,
  ): Promise<CoupleInvite | null> {
    const invite = await prisma.coupleInvite.findFirst({
      where: {
        inviter_id: inviterId,
        invitee_email: inviteeEmail,
      },
    })

    return invite
  }

  async acceptById(id: number): Promise<CoupleInvite> {
    return await prisma.coupleInvite.update({
      where: {
        id,
      },
      data: {
        accepted_at: new Date(),
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
  }

  async declineById(id: number): Promise<CoupleInvite> {
    return await prisma.coupleInvite.update({
      where: {
        id,
      },
      data: {
        rejected_at: new Date(),
      },
    })
  }

  async deleteById(id: number): Promise<void> {
    await prisma.coupleInvite.delete({
      where: {
        id,
      },
    })
  }
}
