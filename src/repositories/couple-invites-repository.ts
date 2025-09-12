import { CoupleInvite, Prisma } from '@prisma/client'

export interface CoupleInvitesRepository {
  listByUserId(userId: number): Promise<CoupleInvite[]>
  listByInviteeEmail(email: string): Promise<CoupleInvite[]>
  create(data: Prisma.CoupleInviteUncheckedCreateInput): Promise<CoupleInvite>
  declineById(id: number): Promise<void>
}
