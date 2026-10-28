import type { components } from './api-types'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields?: unknown,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init.headers,
    },
  })
  if (
    response.status === 401 &&
    !window.location.pathname.startsWith('/acceso')
  ) {
    window.location.assign('/acceso')
  }
  const data: unknown =
    response.status === 204
      ? undefined
      : await response.json().catch(() => undefined)
  if (!response.ok) {
    const payload = data as components['schemas']['ErrorResponse'] | undefined
    throw new ApiError(
      payload?.error.message ?? `Error de solicitud (${response.status})`,
      response.status,
      payload?.error.fields,
      payload?.error.code,
      payload?.error.details,
    )
  }
  return data as T
}
