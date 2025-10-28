/**
 * Converte uma data para o formato esperado pelo RRule (YYYYMMDDTHHmmssZ)
 * compatível com o padrão iCalendar (RFC 5545).
 *
 * @param date - Data a ser formatada
 * @returns String no formato YYYYMMDDTHHmmssZ
 *
 * @example
 * formatDateForRRule(new Date('2025-10-28T14:30:00.000Z'))
 * // Retorna: "20251028T143000Z"
 */
export function formatDateForRRule(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}
