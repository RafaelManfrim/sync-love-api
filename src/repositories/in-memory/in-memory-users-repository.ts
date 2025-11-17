import { Prisma, User } from '@prisma/client'
import { UsersRepository } from '../users-repository'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    return user || null
  }

  async findById(id: number) {
    const user = this.items.find((item) => item.id === id)

    return user || null
  }

  async create(data: Prisma.UserCreateInput) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataWithIds = data as any

    const user: User = {
      id: this.items.length + 1,
      email: data.email,
      name: data.name,
      password_hash: data.password_hash,
      gender: data.gender,
      avatar_url: data.avatar_url ?? null,
      is_admin: data.is_admin ?? false,
      is_premium: data.is_premium ?? false,
      couple_id: dataWithIds.couple_id ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.items.push(user)

    return user
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('User not found')
    }

    const currentUser = this.items[index]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataWithIds = data as any

    const updatedUser: User = {
      ...currentUser,
      name: (data.name as string) ?? currentUser.name,
      email: (data.email as string) ?? currentUser.email,
      password_hash:
        (data.password_hash as string) ?? currentUser.password_hash,
      gender: (data.gender as 'MALE' | 'FEMALE') ?? currentUser.gender,
      avatar_url:
        data.avatar_url !== undefined
          ? (data.avatar_url as string | null)
          : currentUser.avatar_url,
      is_admin:
        data.is_admin !== undefined
          ? (data.is_admin as boolean)
          : currentUser.is_admin,
      is_premium:
        data.is_premium !== undefined
          ? (data.is_premium as boolean)
          : currentUser.is_premium,
      couple_id:
        data.couple && dataWithIds.couple?.connect?.id
          ? dataWithIds.couple.connect.id
          : currentUser.couple_id,
      updated_at: new Date(),
    }

    this.items[index] = updatedUser

    return updatedUser
  }

  async findManyByCoupleId(coupleId: number) {
    return this.items.filter((item) => item.couple_id === coupleId)
  }
}
