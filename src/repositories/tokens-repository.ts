import { Prisma, UserRefreshToken } from '@prisma/client'

export interface TokensRepository {
  create(
    data: Prisma.UserRefreshTokenUncheckedCreateInput,
  ): Promise<UserRefreshToken>
  deleteByUserId(userId: number): Promise<Prisma.BatchPayload>
}
