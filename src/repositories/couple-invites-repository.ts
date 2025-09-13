import { CoupleInvite, Prisma } from '@prisma/client'

export interface CoupleInvitesRepository {
  listByUserId(userId: number): Promise<CoupleInvite[]>
  listByInviteeEmail(email: string): Promise<CoupleInvite[]>
  findById(id: number): Promise<CoupleInvite | null>
  findByInviterIdAndInviteeEmail(
    inviterId: number,
    inviteeEmail: string,
  ): Promise<CoupleInvite | null>
  create(data: Prisma.CoupleInviteUncheckedCreateInput): Promise<CoupleInvite>
  acceptById(id: number): Promise<CoupleInvite>
  declineById(id: number): Promise<CoupleInvite>
  deleteById(id: number): Promise<void>
}
