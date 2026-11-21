const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Correo o contraseña incorrectos.',
  INVALID_PASSWORD: 'Correo o contraseña incorrectos.',
  USER_NOT_FOUND: 'Correo o contraseña incorrectos.',
  INVALID_EMAIL: 'El correo electrónico no es válido.',
  EMAIL_NOT_VERIFIED: 'Debes confirmar tu correo antes de iniciar sesión.',
  COMPANY_INACTIVE: 'Tu compañía está inactiva. Contacta a un administrador.',
  USER_INACTIVE: 'Tu usuario está inactivo. Contacta a un administrador.',
  TOO_MANY_REQUESTS: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
}

export function authErrorMessage(error: {
  code?: string
  status?: number
}): string {
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code]
  if (error.status === 429) return MESSAGES.TOO_MANY_REQUESTS
  if (error.status === 401) return MESSAGES.INVALID_EMAIL_OR_PASSWORD
  return 'No pudimos iniciar sesión. Revisa tus datos.'
}
