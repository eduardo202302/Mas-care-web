import { z } from 'zod'

export const companyStatuses = ['active', 'inactive'] as const

export const companyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresa al menos 2 caracteres.')
    .max(120, 'Máximo 120 caracteres.'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo válido.')
    .max(254, 'Máximo 254 caracteres.'),
  logo: z
    .string()
    .trim()
    .max(400_000, 'La imagen del logo es demasiado grande.')
    .refine((value) => {
      if (!value) return true
      if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) {
        return true
      }
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }, 'Sube una imagen PNG, JPG o WebP válida.'),
  status: z.enum(companyStatuses),
  pin: z
    .string()
    .trim()
    .length(6, 'El PIN debe tener 6 dígitos.')
    .regex(/^\d{6}$/, 'El PIN debe tener 6 dígitos numéricos.'),
  domain: z
    .string()
    .trim()
    .min(3, 'Ingresa un dominio válido.')
    .max(300, 'Máximo 300 caracteres.')
    .refine((value) => {
      try {
        const normalized = /^https?:\/\//i.test(value)
          ? value
          : `https://${value}`
        const url = new URL(normalized)
        return Boolean(url.hostname)
      } catch {
        return false
      }
    }, 'Ingresa un dominio válido, por ejemplo https://farmacia.com.'),
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>

export function generateCompanyPin() {
  const values = crypto.getRandomValues(new Uint32Array(1))
  return String((values[0] ?? 0) % 1_000_000).padStart(6, '0')
}

export function normalizeCompanyDomain(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    return new URL(withScheme).origin
  } catch {
    return ''
  }
}

export function companyLinks(domain: string, token: string) {
  const base = normalizeCompanyDomain(domain)
  if (!base || !token) {
    return { registrationLink: '', loginLink: '' }
  }
  const company = encodeURIComponent(token)
  return {
    registrationLink: `${base}/registro?empresa=${company}`,
    loginLink: `${base}/acceso?empresa=${company}`,
  }
}
