import { Couple, Prisma } from '@prisma/client'

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

export interface CouplesRepository {
  create(data: Prisma.CoupleCreateInput): Promise<Couple>
  findDetailsById(id: number): Promise<CoupledWithUserDetails | null>
}
