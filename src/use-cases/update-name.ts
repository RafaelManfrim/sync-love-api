import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdateNameUseCaseRequest {
  userId: number
  newName: string
}

export class UpdateNameUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId, newName }: UpdateNameUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    await this.usersRepository.update(user.id, {
      name: newName,
    })
  }
}
