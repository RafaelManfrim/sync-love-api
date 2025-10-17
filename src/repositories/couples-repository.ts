import { Couple, Prisma } from '@prisma/client'

export interface CouplesRepository {
  create(data: Prisma.CoupleCreateInput): Promise<Couple>
  findDetailsById(id: number): Promise<Couple | null>
}
