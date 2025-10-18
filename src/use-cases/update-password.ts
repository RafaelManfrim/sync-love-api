import { UsersRepository } from '@/repositories/users-repository'
import { compare, hash } from 'bcryptjs'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface UpdatePasswordUseCaseRequest {
  userId: number
  oldPassword?: string
  newPassword?: string
}

export class UpdatePasswordUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    oldPassword,
    newPassword,
  }: UpdatePasswordUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (oldPassword && newPassword) {
      const doesPasswordMatch = await compare(oldPassword, user.password_hash)

      if (!doesPasswordMatch) {
        throw new InvalidCredentialsError()
      }

      user.password_hash = await hash(newPassword, 6)
    }

    await this.usersRepository.update(user.id, {
      password_hash: user.password_hash,
    })
  }
}
