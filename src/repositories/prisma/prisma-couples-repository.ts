import { prisma } from '@/lib/prisma'
import { CouplesRepository } from '../couples-repository'
import { Couple, Prisma } from '@prisma/client'

export class PrismaCouplesRepository implements CouplesRepository {
  async create(data: Prisma.CoupleCreateInput): Promise<Couple> {
    return await prisma.couple.create({ data })
  }

  async findDetailsById(id: number) {
    const couple = await prisma.couple.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            created_at: true,
          },
        }, // Inclui os dados dos dois usuários
        _count: {
          select: {
            ShoppingLists: true, // Conta as listas de compras
            // Adicione as contagens para tarefas e datas quando os modelos existirem
          },
        },
      },
    })
    return couple
  }
}
