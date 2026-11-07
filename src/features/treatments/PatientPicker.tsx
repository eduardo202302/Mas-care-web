import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ModalSection } from '@/components/ui/ModalSection'
import { api } from '@/lib/http'
import { formatPhone } from '@/lib/phone'
import type { paths } from '@/lib/api-types'

type PatientList =
  paths['/api/v1/patients']['get']['responses'][200]['content']['application/json']
export type PickerPatient = PatientList['data'][number]

const fieldClass =
  'border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white px-3 text-sm transition outline-none focus:ring-2'

function useDebounced(value: string, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

/** Sección "Paciente" del diálogo de Nuevo Tratamiento: busca en el servidor y fija un paciente. */
export function PatientPicker({
  value,
  onChange,
  branchId,
}: {
  value: PickerPatient | null
  onChange: (patient: PickerPatient | null) => void
  branchId?: string
}) {
  const [search, setSearch] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const term = useDebounced(search.trim())
  const patients = useQuery({
    queryKey: ['patients', 'picker', { q: term, branchId }],
    queryFn: () => {
      const params = new URLSearchParams({ archived: 'false', rows: '20' })
      if (term) params.set('q', term)
      if (branchId) params.set('branchId', branchId)
      return api<PatientList>(`/api/v1/patients?${params.toString()}`)
    },
    enabled: !value,
  })
  const items = patients.data?.data ?? []

  return (
    <ModalSection icon={<UserRound className="size-4" />} title="Paciente">
      <div className="grid gap-1.5">
        <label
          htmlFor="treatment-patient"
          className="text-ink text-sm font-medium"
        >
          Paciente <span className="text-red-700">*</span>
        </label>
        {value ? (
          <div className="border-border flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2">
            <div className="min-w-0">
              <p className="text-ink truncate text-sm font-semibold">
                {value.fullName}
              </p>
              <p className="text-muted truncate text-xs">
                ID: <span className="font-semibold">{value.numericId}</span>
                {value.phone ? ` · ${formatPhone(value.phone)}` : ''}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-8 shrink-0 px-2 text-xs"
              onClick={() => {
                onChange(null)
                setSearch('')
              }}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                id="treatment-patient"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setListOpen(true)
                }}
                onFocus={() => setListOpen(true)}
                onBlur={() => window.setTimeout(() => setListOpen(false), 120)}
                placeholder="Buscar por nombre, documento o teléfono…"
                autoComplete="off"
                role="combobox"
                aria-expanded={listOpen}
                aria-controls="treatment-patient-options"
                aria-autocomplete="list"
                className={`${fieldClass} pr-9 pl-9`}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => setSearch('')}
                  className="text-muted hover:text-ink absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            {listOpen && (
              <div
                id="treatment-patient-options"
                role="listbox"
                aria-label="Pacientes"
                className="app-scroll border-border mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white p-1 shadow-lg"
              >
                {patients.isFetching ? (
                  <p className="text-muted px-3 py-2 text-sm">Buscando…</p>
                ) : items.length ? (
                  items.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onChange(patient)
                        setListOpen(false)
                      }}
                      className="hover:bg-surface flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left"
                    >
                      <span className="text-ink text-sm font-medium">
                        {patient.fullName}
                      </span>
                      <span className="text-muted text-xs">
                        ID: {patient.numericId}
                        {patient.phone
                          ? ` · ${formatPhone(patient.phone)}`
                          : ''}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-muted px-3 py-2 text-sm">
                    No encontramos pacientes con esa búsqueda.
                  </p>
                )}
              </div>
            )}
            {patients.isError && (
              <p role="alert" className="text-xs text-red-700">
                No pudimos cargar los pacientes.
              </p>
            )}
          </>
        )}
      </div>
    </ModalSection>
  )
}
