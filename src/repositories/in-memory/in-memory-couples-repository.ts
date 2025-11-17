import { Couple, Prisma, User } from '@prisma/client'
import { CouplesRepository } from '../couples-repository'

type CoupledWithUserDetails = Couple & {
  User: {
    id: number
    name: string
    email: string
    avatar_url: string | null
    created_at: Date
  }[]
  _count: {
    ShoppingLists: number
  }
}

export class InMemoryCouplesRepository implements CouplesRepository {
  public items: Couple[] = []
  public users: User[] = []
  public shoppingListsCount: Record<number, number> = {}

  async create(data: Prisma.CoupleCreateInput) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataWithIds = data as any

    const couple: Couple = {
      id: this.items.length + 1,
      invite_id: dataWithIds.invite_id || 0,
      inviter_id: dataWithIds.inviter_id || 0,
      invitee_id: dataWithIds.invitee_id || 0,
      created_at: new Date(),
      is_active: data.is_active ?? true,
    }

    this.items.push(couple)

    return couple
  }

  async findDetailsById(id: number) {
    const couple = this.items.find((item) => item.id === id)

    if (!couple) {
      return null
    }

    const coupleUsers = this.users
      .filter((user) => user.couple_id === id)
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      }))

    return {
      ...couple,
      User: coupleUsers,
      _count: {
        ShoppingLists: this.shoppingListsCount[id] || 0,
      },
    } as CoupledWithUserDetails
  }
}
