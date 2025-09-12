import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { UserNotFoundError } from './errors/user-not-found-error'

interface UserDataUseCaseRequest {
  userId: number
}

interface UserDataUseCaseResponse {
  user: User
}

export class UserDataUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: UserDataUseCaseRequest): Promise<UserDataUseCaseResponse> {
    if (!userId) {
      throw new UserNotFoundError()
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    return { user }
  }
}
