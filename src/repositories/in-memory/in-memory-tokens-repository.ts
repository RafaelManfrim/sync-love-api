import { Prisma, UserRefreshToken } from '@prisma/client'
import { TokensRepository } from '../tokens-repository'

export class InMemoryTokensRepository implements TokensRepository {
  public items: UserRefreshToken[] = []

  async findByUserId(userId: number) {
    const token = this.items.find((item) => item.user_id === userId)

    return token || null
  }

  async create(data: Prisma.UserRefreshTokenUncheckedCreateInput) {
    const token: UserRefreshToken = {
      id: this.items.length + 1,
      user_id: data.user_id,
      token: data.token,
      created_at: new Date(),
      updated_at: new Date(),
      expires_at: new Date(data.expires_at),
    }

    this.items.push(token)

    return token
  }

  async deleteByUserId(userId: number) {
    const initialLength = this.items.length
    this.items = this.items.filter((item) => item.user_id !== userId)
    const deletedCount = initialLength - this.items.length

    return { count: deletedCount }
  }
}
