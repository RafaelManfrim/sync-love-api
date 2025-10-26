import { HouseholdTask, Prisma } from '@prisma/client'

export interface HouseholdTasksRepository {
  create(data: Prisma.HouseholdTaskUncheckedCreateInput): Promise<HouseholdTask>

  findById(id: number): Promise<HouseholdTask | null>

  // Só retorna tarefas ativas
  findManyByCoupleId(coupleId: number): Promise<HouseholdTask[]>

  // Necessário para o Sumário, que precisa ver tarefas deletadas
  findAllByCoupleIdIncludingDeleted(coupleId: number): Promise<HouseholdTask[]>

  update(
    id: number,
    data: Prisma.HouseholdTaskUncheckedUpdateInput,
  ): Promise<HouseholdTask>

  softDeleteById(id: number): Promise<void>
  countByCoupleId(coupleId: number): Promise<number>
}
