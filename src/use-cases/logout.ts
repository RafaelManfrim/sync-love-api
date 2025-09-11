import { UsersRepository } from '@/repositories/users-repository'
import { hash } from 'bcryptjs'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { User } from '@prisma/client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { TokensRepository } from '@/repositories/tokens-repository'

interface RegisterUseCaseRequest {
  userId: number
}

interface RegisterUseCaseResponse {
  user: User
}

export class LogoutUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private tokensRepository: TokensRepository,
  ) {}

  async execute({
    userId,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    if (!userId) {
      throw new ResourceNotFoundError()
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    await this.tokensRepository.deleteByUserId(userId)

    return { user }
  }
}
