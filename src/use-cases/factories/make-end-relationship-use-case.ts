import { EndRelationshipUseCase } from '../end-relationship'

export function makeEndRelationshipUseCase() {
  const useCase = new EndRelationshipUseCase()
  return useCase
}
