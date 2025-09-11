export interface CoupleInvitesRepository {
  create(): Promise<void>
  listByUserId(userId: number): Promise<any[]>
  declineById(id: number): Promise<void>
}
