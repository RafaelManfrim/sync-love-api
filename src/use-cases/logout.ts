import { UsersRepository } from '@/repositories/users-repository'
import { User } from '@prisma/client'
import { TokensRepository } from '@/repositories/tokens-repository'
import { UserNotFoundError } from './errors/user-not-found-error'

interface LogoutUseCaseRequest {
  userId: number
}

interface LogoutUseCaseResponse {
  user: User
}

export class LogoutUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokensRepository: TokensRepository,
  ) {}

  async execute({
    userId,
  }: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    if (!userId) {
      throw new UserNotFoundError()
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    await this.tokensRepository.deleteByUserId(userId)

    return { user }
  }
}
