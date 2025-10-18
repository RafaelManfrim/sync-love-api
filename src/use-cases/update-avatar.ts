import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { unlink } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { MultipartFile } from '@fastify/multipart'

interface UpdateAvatarUseCaseRequest {
  userId: number
  file: MultipartFile
}

interface UpdateAvatarUseCaseResponse {
  avatarUrl: string
}

export class UpdateAvatarUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    file,
  }: UpdateAvatarUseCaseRequest): Promise<UpdateAvatarUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    // Se o utilizador já tiver um avatar, guardamos o nome do ficheiro antigo para apagar depois
    const oldAvatarFileName = user.avatar_url

    // Gera um nome de ficheiro único para evitar conflitos
    const fileId = randomUUID()
    const extension = file.filename.substring(file.filename.lastIndexOf('.'))
    const fileName = fileId.concat(extension)

    const uploadDir = resolve(__dirname, '..', '..', 'tmp', 'uploads', 'avatar')
    const writeStream = createWriteStream(`${uploadDir}/${fileName}`)

    // Guarda o ficheiro no disco
    await pipeline(file.file, writeStream)

    // Atualiza o utilizador com o nome do novo ficheiro
    user.avatar_url = fileName
    await this.usersRepository.update(user.id, {
      avatar_url: user.avatar_url,
    })

    // Se existia um avatar antigo, apaga-o do disco
    if (oldAvatarFileName) {
      try {
        await unlink(`${uploadDir}/${oldAvatarFileName}`)
      } catch (error) {
        // Se o ficheiro antigo não for encontrado, não há problema.
        console.error(
          `Falha ao apagar o avatar antigo: ${oldAvatarFileName}`,
          error,
        )
      }
    }

    return {
      avatarUrl: fileName,
    }
  }
}
