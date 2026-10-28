import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { api, ApiError } from '@/lib/http'

type CompanyPreview = {
  name: string
  logo: string | null
}

export function CompanyBadge({ reference }: { reference: string }) {
  const [company, setCompany] = useState<CompanyPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!reference) return
    let active = true
    setLoading(true)
    setError('')
    api<CompanyPreview>(
      `/api/v1/register/company/${encodeURIComponent(reference)}`,
    )
      .then((preview) => {
        if (active) setCompany(preview)
      })
      .catch((err) => {
        if (!active) return
        setCompany(null)
        if (err instanceof ApiError && err.status === 429) {
          setError(
            'Demasiadas consultas. Espera un momento y vuelve a intentar.',
          )
        } else if (err instanceof ApiError && err.status === 404) {
          setError('No encontramos la compañía de este enlace.')
        } else {
          setError('No pudimos cargar la compañía. Inténtalo de nuevo.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reference])

  if (!reference) return null

  return (
    <div className="mb-4 flex min-h-24 flex-col items-center justify-center text-center">
      {company ? (
        <>
          <span className="border-border grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl border bg-white">
            {company.logo ? (
              <img
                src={company.logo}
                alt=""
                className="size-full object-contain p-2"
              />
            ) : (
              <Building2 className="text-petroleo size-10" />
            )}
          </span>
          <p className="text-petroleo mt-2 text-xl font-semibold">
            {company.name}
          </p>
        </>
      ) : loading ? (
        <p className="text-muted text-sm">Cargando compañía…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}
