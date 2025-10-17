import { CouplesRepository } from '@/repositories/couples-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface GetCoupleDetailsUseCaseRequest {
  coupleId: number
}

export class GetCoupleDetailsUseCase {
  constructor(private couplesRepository: CouplesRepository) {}

  async execute({ coupleId }: GetCoupleDetailsUseCaseRequest) {
    const coupleDetails = await this.couplesRepository.findDetailsById(coupleId)

    if (!coupleDetails) {
      throw new ResourceNotFoundError()
    }

    return {
      coupleDetails,
    }
  }
}
