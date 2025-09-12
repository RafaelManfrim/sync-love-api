import { Prisma, UserRefreshToken } from '@prisma/client'

export interface TokensRepository {
  findByUserId(userId: number): Promise<UserRefreshToken | null>
  create(
    data: Prisma.UserRefreshTokenUncheckedCreateInput,
  ): Promise<UserRefreshToken>
  deleteByUserId(userId: number): Promise<Prisma.BatchPayload>
}
