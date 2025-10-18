import { prisma } from '@/lib/prisma'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { UsersRepository } from '@/repositories/users-repository'
import { EndRelationshipUseCase } from './end-relationship' // Reutilizar o use case!
import { unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

interface DeleteAccountUseCaseRequest {
  userId: number
}

export class DeleteAccountUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: DeleteAccountUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    // Iniciar a transação
    await prisma.$transaction(async (tx) => {
      // Passo 1: Se o utilizador estiver num relacionamento, terminar.
      if (user.couple_id) {
        // Instanciamos e executamos o use case de terminar relacionamento dentro da transação.
        // NOTA: Precisamos de uma pequena refatoração no EndRelationshipUseCase para aceitar o `tx`.
        const endRelationshipUseCase = new EndRelationshipUseCase()
        await endRelationshipUseCase.execute(
          { coupleId: user.couple_id },
          tx as unknown as PrismaClient,
        )
      }

      // Passo 2: Apagar dados pessoais que impedem a exclusão do utilizador (relações)
      await tx.userRefreshToken.deleteMany({
        where: { user_id: userId },
      })
      await tx.coupleInvite.deleteMany({
        where: { inviter_id: userId },
      })
      // Adicionar aqui a exclusão de outros dados pessoais se existirem

      // Passo 3: Apagar o utilizador
      await tx.user.delete({
        where: { id: userId },
      })
    })

    // Passo 4: Apagar o ficheiro do avatar do disco (fora da transação)
    if (user.avatar_url) {
      try {
        const uploadDir = resolve(__dirname, '..', '..', 'tmp')
        await unlink(`${uploadDir}/${user.avatar_url}`)
      } catch (error) {
        console.error(
          `Falha ao apagar o avatar do utilizador excluído: ${user.avatar_url}`,
          error,
        )
      }
    }
  }
}
