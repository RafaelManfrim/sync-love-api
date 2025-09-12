export function decodeJWT(jwt: string) {
  // Divida o token em suas partes (header, payload, signature)
  const parts = jwt.split('.')

  if (parts.length !== 3) {
    throw new Error('Token JWT inválido')
  }

  // Decodifique a parte do payload (Base64Url -> JSON)
  const base64UrlPayload = parts[1]
  const base64Payload = base64UrlPayload.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = atob(base64Payload)

  // Converta o JSON para um objeto JavaScript
  return JSON.parse(jsonPayload)
}
