import { PrismaCouplesRepository } from '@/repositories/prisma/prisma-couples-repository'
import { GetCoupleDetailsUseCase } from '../get-couple-details'

export function makeGetCoupleDetailsUseCase() {
  const couplesRepository = new PrismaCouplesRepository()
  const useCase = new GetCoupleDetailsUseCase(couplesRepository)

  return useCase
}
