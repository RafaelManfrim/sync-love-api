import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { TokensRepository } from '../tokens-repository'

export class PrismaTokensRepository implements TokensRepository {
  async findByUserId(userId: number) {
    const token = await prisma.userRefreshToken.findFirst({
      where: {
        user_id: userId,
      },
    })

    return token
  }

  async create(data: Prisma.UserRefreshTokenUncheckedCreateInput) {
    const token = await prisma.userRefreshToken.create({
      data,
    })

    return token
  }

  async deleteByUserId(userId: number) {
    const deletedTokens = await prisma.userRefreshToken.deleteMany({
      where: {
        user_id: userId,
      },
    })

    return deletedTokens
  }
}
