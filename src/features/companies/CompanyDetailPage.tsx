import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  Mail,
  Pencil,
  Phone,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FormActions } from '@/components/ui/FormActions'
import { Dialog } from '@/components/ui/Dialog'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { InfoFact } from '@/components/ui/InfoCard'
import { api } from '@/lib/http'
import { authClient } from '@/lib/auth-client'
import { formatPhone } from '@/lib/phone'
import { useCan } from '@/lib/permissions'
import { useUiStore } from '@/stores/ui-store'
import type { components } from '@/lib/api-types'
import type { CompanyFormValues } from '@/schemas/company'
import { CompanyActivityPanel } from './CompanyActivityPanel'
import { CompanyForm } from './CompanyForm'
import { CompanyRelationsPanel } from './CompanyRelationsPanel'

type CompanyDetail = components['schemas']['CompanyDetail']

type PropertyKey = keyof CompanyDetail

type PropertyGroup = 'General' | 'Negocio' | 'Dirección' | 'Contacto' | 'Métricas'

type PropertyDef = {
  key: PropertyKey
  label: string
  group: PropertyGroup
  value: (record: CompanyDetail) => string
}

const PROPERTY_GROUP_ORDER: PropertyGroup[] = [
  'General',
  'Negocio',
  'Dirección',
  'Contacto',
  'Métricas',
]

const PROPERTY_CATALOG: PropertyDef[] = [
  { key: 'status', label: 'Estado', group: 'General', value: (r) => (r.status === 'active' ? 'Activo' : 'Inactivo') },
  { key: 'description', label: 'Descripción', group: 'General', value: (r) => r.description || '--' },
  { key: 'pin', label: 'PIN', group: 'General', value: (r) => r.pin || '--' },
  {
    key: 'createdAt',
    label: 'Fecha de creación',
    group: 'General',
    value: (r) =>
      new Date(r.createdAt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' }),
  },

  { key: 'ownerName', label: 'Propietario de la empresa', group: 'Negocio', value: (r) => r.ownerName || 'Sin propietario' },
  { key: 'type', label: 'Tipo de negocio', group: 'Negocio', value: (r) => r.type || '--' },
  { key: 'industry', label: 'Industria', group: 'Negocio', value: (r) => r.industry || '--' },
  { key: 'employeeCount', label: 'Número de empleados', group: 'Negocio', value: (r) => r.employeeCount?.toString() || '--' },

  { key: 'city', label: 'Ciudad', group: 'Dirección', value: (r) => r.city || '--' },
  { key: 'state', label: 'Región', group: 'Dirección', value: (r) => r.state || '--' },

  { key: 'email', label: 'Correo electrónico', group: 'Contacto', value: (r) => r.email || '--' },
  { key: 'phone', label: 'Teléfono', group: 'Contacto', value: (r) => formatPhone(r.phone) || '--' },
  { key: 'domain', label: 'Dominio', group: 'Contacto', value: (r) => r.domain || '--' },
  { key: 'linkedinUrl', label: 'LinkedIn', group: 'Contacto', value: (r) => r.linkedinUrl || '--' },

  { key: 'memberCount', label: 'Usuarios', group: 'Métricas', value: (r) => r.memberCount.toString() },
  { key: 'branchCount', label: 'Sucursales', group: 'Métricas', value: (r) => r.branchCount.toString() },
  { key: 'patientCount', label: 'Pacientes', group: 'Métricas', value: (r) => r.patientCount.toString() },
  { key: 'openCycleCount', label: 'Ciclos abiertos', group: 'Métricas', value: (r) => r.openCycleCount.toString() },
  { key: 'openIncidentCount', label: 'Incidencias abiertas', group: 'Métricas', value: (r) => r.openIncidentCount.toString() },
]

const DEFAULT_PROPERTY_KEYS: PropertyKey[] = [
  'ownerName',
  'city',
  'industry',
  'status',
  'type',
]

const CUSTOM_PROPERTIES_STORAGE_KEY = 'company-detail-visible-properties'

function loadVisibleProperties(): PropertyKey[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROPERTIES_STORAGE_KEY)
    if (!raw) return DEFAULT_PROPERTY_KEYS
    const parsed = JSON.parse(raw) as string[]
    const valid = parsed.filter((key) =>
      PROPERTY_CATALOG.some((property) => property.key === key),
    ) as PropertyKey[]
    return valid.length ? valid : DEFAULT_PROPERTY_KEYS
  } catch {
    return DEFAULT_PROPERTY_KEYS
  }
}

function QuickAction({
  icon: Icon,
  label,
  tone,
  onClick,
}: {
  icon: LucideIcon
  label: string
  tone: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-muted hover:text-petroleo flex flex-col items-center gap-1 text-[11px] font-medium"
    >
      <span
        className={`grid size-8 place-items-center rounded-full border transition hover:brightness-95 ${tone}`}
      >
        <Icon className="size-3.5" />
      </span>
      {label}
    </button>
  )
}

function BehaviorMenu({
  onCustomizeProperties,
  onViewAllProperties,
}: {
  onCustomizeProperties: () => void
  onViewAllProperties: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const itemClass =
    'hover:bg-surface text-ink flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="text-muted hover:text-petroleo flex items-center gap-1 text-xs font-semibold"
      >
        Comportamiento
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Comportamiento"
          className="border-border absolute right-0 z-30 mt-1 w-56 rounded-xl border bg-white p-1.5 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false)
              onCustomizeProperties()
            }}
          >
            Personalizar propiedades
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              setOpen(false)
              onViewAllProperties()
            }}
          >
            Ver todas las propiedades
          </button>
        </div>
      )}
    </div>
  )
}

export default function CompanyDetailPage() {
  const { id = '' } = useParams()
  const canManage = useCan('companies:write')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const setActiveBranchId = useUiStore((state) => state.setActiveBranchId)
  const [editing, setEditing] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [viewingProperties, setViewingProperties] = useState(false)
  const [customizingProperties, setCustomizingProperties] = useState(false)
  const [visibleProperties, setVisibleProperties] = useState<PropertyKey[]>(() =>
    loadVisibleProperties(),
  )
  const [draftProperties, setDraftProperties] = useState<PropertyKey[]>(visibleProperties)

  const company = useQuery({
    queryKey: ['companies', id],
    queryFn: () =>
      api<CompanyDetail>(`/api/v1/companies/${encodeURIComponent(id)}`),
    enabled: Boolean(id),
  })

  const update = useMutation({
    mutationFn: (values: CompanyFormValues) =>
      api<CompanyDetail>(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      setEditing(false)
    },
  })

  const updateLogo = useMutation({
    mutationFn: (logo: string | null) =>
      api<CompanyDetail>(`/api/v1/companies/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ logo }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })

  if (company.isLoading)
    return (
      <div className="grid gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  if (company.isError || !company.data)
    return (
      <div>
        <Link
          to="/companias"
          className="text-tealmax inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          Volver a compañías
        </Link>
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
        >
          No pudimos cargar esta compañía. {company.error?.message}
        </p>
      </div>
    )

  const record = company.data

  async function goTo(path: string) {
    setSwitching(true)
    const result = await authClient.organization.setActive({
      organizationId: record.id,
    })
    if (!result.error) {
      setActiveBranchId(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['branches'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
      ])
    }
    setSwitching(false)
    navigate(path)
  }

  return (
    <div className="animate-in">
      <Link
        to="/companias"
        className="text-muted hover:text-petroleo mb-2 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="size-4" />
        Compañías
      </Link>
      <PageHeader
        title={record.name}
        subtitle={record.domain}
        size="large"
        actions={
          canManage ? (
            <Button variant="primary" onClick={() => setEditing(true)}>
              Editar
            </Button>
          ) : undefined
        }
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(250px,0.9fr)_minmax(360px,1.35fr)_minmax(230px,0.8fr)]">
        <div className="grid gap-4">
          <div className="border-border rounded-xl border bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="bg-tealmax/10 text-petroleo grid size-10 shrink-0 place-items-center overflow-hidden rounded-full">
                {record.logo ? (
                  <img
                    src={record.logo}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-petroleo truncate text-base font-semibold">
                    {record.name}
                  </p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      aria-label="Editar compañía"
                      className="text-muted hover:text-petroleo shrink-0"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <a
                    href={record.domain}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tealmax truncate text-sm hover:underline"
                  >
                    {record.domain}
                  </a>
                  <ExternalLink className="text-muted size-3 shrink-0" />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(record.domain)}
                    aria-label="Copiar dominio"
                    className="text-muted hover:text-petroleo shrink-0"
                  >
                    <Copy className="size-3 shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-border mt-4 flex items-start justify-between gap-1 border-t pt-4">
              <QuickAction
                icon={FileText}
                label="Nota"
                tone="border-amber-200 bg-amber-50 text-amber-700"
                onClick={() => setEditing(true)}
              />
              <QuickAction
                icon={Mail}
                label="Correo"
                tone="border-sky-200 bg-sky-50 text-sky-700"
                onClick={() => setEditing(true)}
              />
              <QuickAction
                icon={Phone}
                label="Llamar"
                tone="border-emerald-200 bg-emerald-50 text-emerald-700"
                onClick={() => setEditing(true)}
              />
              <QuickAction
                icon={ClipboardList}
                label="Tarea"
                tone="border-violet-200 bg-violet-50 text-violet-700"
                onClick={() => setEditing(true)}
              />
              <QuickAction
                icon={Users}
                label="Reunión"
                tone="border-teal-200 bg-teal-50 text-teal-700"
                onClick={() => setEditing(true)}
              />
            </div>
          </div>

          <div className="border-border overflow-hidden rounded-xl border bg-white">
            <header className="border-border flex items-center gap-2 border-b px-4 py-2.5">
              <ChevronDown className="text-muted size-4 shrink-0" />
              <h3 className="text-petroleo flex-1 text-sm font-semibold">
                Información clave
              </h3>
              <BehaviorMenu
                onCustomizeProperties={() => {
                  setDraftProperties(visibleProperties)
                  setCustomizingProperties(true)
                }}
                onViewAllProperties={() => setViewingProperties(true)}
              />
            </header>
            <div className="bg-surface flex flex-col gap-3 p-4">
              {PROPERTY_CATALOG.filter((property) =>
                visibleProperties.includes(property.key),
              ).map((property) => (
                <InfoFact
                  key={property.key}
                  label={property.label}
                  value={property.value(record)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <CompanyActivityPanel companyId={record.id} />
        </div>

        <div className="grid gap-4">
          <CompanyRelationsPanel
            companyId={record.id}
            companyName={record.name}
            contacts={record.contacts}
            switching={switching}
            onGoToPatients={() => goTo('/pacientes')}
          />
        </div>
      </div>

      {editing && (
        <Dialog
          title="Editar Compañía"
          description="Actualiza los datos de la compañía."
          icon={<Building2 className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          size="lg"
          onClose={() => setEditing(false)}
        >
          <CompanyForm
            mode="edit"
            initialValues={{
              name: record.name,
              email: record.email,
              logo: record.logo ?? '',
              status: record.status,
              pin: record.pin,
              domain: record.domain,
              phone: record.phone ?? '',
              ownerName: record.ownerName ?? '',
              industry: record.industry ?? '',
              type: record.type ?? '',
              city: record.city ?? '',
              state: record.state ?? '',
              address: record.address ?? '',
              sector: record.sector ?? '',
              latitude: record.latitude ?? '',
              longitude: record.longitude ?? '',
              employeeCount: record.employeeCount?.toString() ?? '',
              description: record.description ?? '',
              linkedinUrl: record.linkedinUrl ?? '',
              googleMapsApiKey: record.googleMapsApiKey ?? '',
            }}
            linkToken={record.linkToken}
            onLogoChange={async (logo) => {
              await updateLogo.mutateAsync(logo)
            }}
            onSave={(values) => update.mutateAsync(values).then(() => undefined)}
            onCancel={() => setEditing(false)}
            submitting={update.isPending}
          />
        </Dialog>
      )}

      {viewingProperties && (
        <Dialog
          title="Todas las propiedades"
          description="Todos los datos disponibles de esta compañía."
          icon={<ClipboardList className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setViewingProperties(false)}
        >
          <div className="grid gap-3">
            {PROPERTY_CATALOG.map((property) => (
              <InfoFact
                key={property.key}
                label={property.label}
                value={property.value(record)}
              />
            ))}
          </div>
        </Dialog>
      )}

      {customizingProperties && (
        <Dialog
          title="Personalizar propiedades"
          description="Elige qué propiedades mostrar en Información clave."
          icon={<ClipboardList className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          onClose={() => setCustomizingProperties(false)}
        >
          <div className="grid gap-3">
            {PROPERTY_GROUP_ORDER.map((group) => (
              <div key={group} className="border-border overflow-hidden rounded-xl border">
                <header className="bg-surface border-border border-b px-3 py-2">
                  <h4 className="text-petroleo text-xs font-semibold">{group}</h4>
                </header>
                <div className="grid gap-1 p-1.5">
                  {PROPERTY_CATALOG.filter((property) => property.group === group).map(
                    (property) => (
                      <label
                        key={property.key}
                        className="hover:bg-surface flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={draftProperties.includes(property.key)}
                          onChange={(event) =>
                            setDraftProperties((current) =>
                              event.target.checked
                                ? [...current, property.key]
                                : current.filter((key) => key !== property.key),
                            )
                          }
                          className="accent-tealmax size-4"
                        />
                        <span className="text-ink">{property.label}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
          <FormActions>
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => setCustomizingProperties(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => {
                setVisibleProperties(draftProperties)
                localStorage.setItem(
                  CUSTOM_PROPERTIES_STORAGE_KEY,
                  JSON.stringify(draftProperties),
                )
                setCustomizingProperties(false)
              }}
            >
              Guardar
            </Button>
          </FormActions>
        </Dialog>
      )}
    </div>
  )
}
