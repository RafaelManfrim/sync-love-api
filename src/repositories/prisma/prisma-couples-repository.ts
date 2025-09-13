import { prisma } from '@/lib/prisma'
import { CouplesRepository } from '../couples-repository'
import { Couple, Prisma } from '@prisma/client'

export class PrismaCouplesRepository implements CouplesRepository {
  async create(data: Prisma.CoupleCreateInput): Promise<Couple> {
    return await prisma.couple.create({ data })
  }
}
