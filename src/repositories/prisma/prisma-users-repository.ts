import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        couple: {
          select: {
            invite_id: true,
            created_at: true,
            is_active: true,
            invitee_id: true,
            User: {
              where: {
                email: {
                  not: email,
                },
              },
              select: {
                name: true,
                email: true,
                avatar_url: true,
                gender: true,
              },
            },
          },
        },
      },
    })

    return user
  }

  async findById(id: number) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        couple: {
          select: {
            invite_id: true,
            created_at: true,
            is_active: true,
            invitee_id: true,
            User: {
              where: {
                id: {
                  not: id,
                },
              },
              select: {
                name: true,
                email: true,
                avatar_url: true,
                gender: true,
              },
            },
          },
        },
      },
    })

    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    })

    return user
  }
}
