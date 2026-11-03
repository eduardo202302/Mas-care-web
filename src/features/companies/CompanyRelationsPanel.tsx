import { useRef, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, FileText, HandCoins, Paperclip, Plus, Trash2, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'
import { pageQuery } from '@/lib/paging'
import { medicationName } from '@/lib/treatments'
import type { components, paths } from '@/lib/api-types'

type CompanyContact = components['schemas']['CompanyContact']
type Deal = components['schemas']['Deal']
type DealCreateBody = components['schemas']['DealCreate']
type DealStage = Deal['stage']
type DealType = Deal['dealType']
type Medication = components['schemas']['Medication']
type DealList =
  paths['/api/v1/companies/{id}/deals']['get']['responses'][200]['content']['application/json']
type MedicationList =
  paths['/api/v1/companies/{id}/medications']['get']['responses'][200]['content']['application/json']

const stageLabels: Record<DealStage, string> = {
  appointment_scheduled: 'Cita programada',
  qualified_to_buy: 'Calificado para comprar',
  presentation_scheduled: 'Presentación programada',
  decision_maker_bought_in: 'Decisor involucrado',
  contract_sent: 'Contrato enviado',
  closed_won: 'Negocio cerrado y ganado',
  closed_lost: 'Negocio cerrado y perdido',
}

const dealTypeLabels: Record<DealType, string> = {
  new_business: 'Negocio nuevo',
  existing_business: 'Negocio existente',
}

const selectClass =
  'border-border text-ink focus:border-tealmax focus:ring-tealmax/15 h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm transition outline-none focus:ring-2'

function CollapsibleSection({
  title,
  count,
  children,
  onAdd,
}: {
  title: string
  count: number
  children: ReactNode
  onAdd?: () => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <section className="border-border overflow-hidden rounded-xl border bg-white">
      <header className="flex items-center justify-between gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-petroleo flex min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold"
        >
          <ChevronDown
            className={`size-4 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`}
          />
          <span className="truncate">
            {title} ({count})
          </span>
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="text-tealmax flex shrink-0 items-center gap-1 text-xs font-semibold hover:underline"
          >
            <Plus className="size-3.5" />
            Agregar
          </button>
        )}
      </header>
      {open && <div className="border-border border-t px-4 py-3">{children}</div>}
    </section>
  )
}

function EmptyRelation({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="bg-tealmax/10 text-petroleo grid size-9 place-items-center rounded-full">
        {icon}
      </span>
      <p className="text-muted text-xs">{text}</p>
    </div>
  )
}

function ContactCard({ contact }: { contact: CompanyContact }) {
  const initial = contact.fullName.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className="border-border rounded-lg border p-3">
      <div className="flex items-start gap-2.5">
        <span className="bg-tealmax/10 text-petroleo grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ink text-sm font-semibold">{contact.fullName}</p>
          {contact.email && <p className="text-muted truncate text-xs">{contact.email}</p>}
          {contact.phone && <p className="text-muted text-xs">{contact.phone}</p>}
        </div>
      </div>
    </div>
  )
}

function formatAmount(amount: number | null) {
  if (amount === null) return null
  return amount.toLocaleString('es', { style: 'currency', currency: 'USD' })
}

function formatCloseDate(closeDate: string | null) {
  if (!closeDate) return null
  return new Date(closeDate).toLocaleDateString('es', { dateStyle: 'medium' })
}

function DealCard({ deal }: { deal: Deal }) {
  const amount = formatAmount(deal.amount)
  const closeDate = formatCloseDate(deal.closeDate)
  return (
    <div className="border-border rounded-lg border p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-ink text-sm font-semibold">{deal.name}</p>
        <span className="border-border text-muted shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium">
          {stageLabels[deal.stage]}
        </span>
      </div>
      <div className="text-muted mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
        {amount && <span>{amount}</span>}
        {closeDate && <span>Cierra: {closeDate}</span>}
        {deal.contactName && <span>{deal.contactName}</span>}
        {deal.ownerName && <span>Propietario: {deal.ownerName}</span>}
      </div>
    </div>
  )
}

type MedicationItemDraft = { name: string; quantity: string; unitPrice: string }

function MedicationItemsEditor({
  items,
  medications,
  onChange,
}: {
  items: MedicationItemDraft[]
  medications: Medication[]
  onChange: (items: MedicationItemDraft[]) => void
}) {
  function update(index: number, patch: Partial<MedicationItemDraft>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }
  return (
    <div className="grid gap-2">
      <span className="text-ink text-sm font-medium">Medicamentos</span>
      {items.map((item, index) => (
        <div key={index} className="border-border grid grid-cols-[1fr_5rem_auto] gap-2 rounded-lg border p-2">
          <select
            aria-label="Medicamento"
            value={item.name}
            onChange={(event) => update(index, { name: event.target.value })}
            className="border-border focus:border-tealmax h-9 rounded-md border bg-white px-2 text-sm outline-none"
          >
            <option value="">Selecciona un medicamento</option>
            {medications.map((medication) => (
              <option key={medication.id} value={medicationName(medication)}>
                {medicationName(medication)} ({medication.presentation})
              </option>
            ))}
          </select>
          <input
            aria-label="Cantidad"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Cant."
            value={item.quantity}
            onChange={(event) => update(index, { quantity: event.target.value })}
            className="border-border focus:border-tealmax h-9 rounded-md border bg-white px-2 text-sm outline-none"
          />
          <button
            type="button"
            aria-label="Quitar medicamento"
            onClick={() => remove(index)}
            className="text-muted hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { name: '', quantity: '1', unitPrice: '0' }])}
        className="text-tealmax flex items-center gap-1 text-xs font-semibold hover:underline"
      >
        <Plus className="size-3.5" />
        Agregar medicamento
      </button>
    </div>
  )
}

function DealCreateForm({
  companyName,
  medications,
  onSave,
  onCancel,
  submitting,
}: {
  companyName: string
  medications: Medication[]
  onSave: (body: DealCreateBody) => Promise<void>
  onCancel: () => void
  submitting: boolean
}) {
  const [name, setName] = useState('')
  const [dealType, setDealType] = useState<DealType>('new_business')
  const [amount, setAmount] = useState('')
  const [closeDate, setCloseDate] = useState('')
  const [medicationItems, setMedicationItems] = useState<MedicationItemDraft[]>([])

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        void onSave({
          name: name.trim(),
          dealType,
          amount: amount.trim() ? Number(amount) : null,
          closeDate: closeDate ? new Date(closeDate).toISOString() : null,
          lineItems: medicationItems
            .filter((item) => item.name.trim())
            .map((item) => ({
              name: item.name.trim(),
              quantity: item.quantity.trim() ? Number(item.quantity) : 1,
              unitPrice: Number(item.unitPrice || 0),
            })),
        })
      }}
    >
      <TextField
        label="Nombre de la oferta"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Monto"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <TextField
          label="Fecha de cierre"
          type="date"
          value={closeDate}
          onChange={(event) => setCloseDate(event.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="deal-type" className="text-ink text-sm font-medium">
          Tipo de oferta
        </label>
        <select
          id="deal-type"
          value={dealType}
          onChange={(event) => setDealType(event.target.value as DealType)}
          className={selectClass}
        >
          {Object.entries(dealTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <TextField label="Compañía" value={companyName} disabled readOnly />

      <MedicationItemsEditor
        items={medicationItems}
        medications={medications}
        onChange={setMedicationItems}
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || !name.trim()}>
          Guardar
        </Button>
      </div>
    </form>
  )
}

function ExistingDealPicker({
  deals,
  onDone,
}: {
  deals: Deal[]
  onDone: () => void
}) {
  const [dealId, setDealId] = useState('')
  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="existing-deal" className="text-ink text-sm font-medium">
          Oferta existente
        </label>
        <select
          id="existing-deal"
          value={dealId}
          onChange={(event) => setDealId(event.target.value)}
          className={selectClass}
        >
          <option value="">Selecciona una oferta</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {deal.name}
            </option>
          ))}
        </select>
        <p className="text-muted text-xs">
          Las ofertas de esta compañía ya están asociadas a su registro.
        </p>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="button" variant="primary" disabled={!dealId} onClick={onDone}>
          Agregar
        </Button>
      </div>
    </div>
  )
}

export function CompanyRelationsPanel({
  companyId,
  companyName,
  contacts,
  onGoToPatients,
  switching,
}: {
  companyId: string
  companyName: string
  contacts: CompanyContact[]
  onGoToPatients: () => void
  switching: boolean
}) {
  const queryClient = useQueryClient()
  const [creatingDeal, setCreatingDeal] = useState(false)
  const [dealTab, setDealTab] = useState<'new' | 'existing'>('new')
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const deals = useQuery({
    queryKey: ['companies', companyId, 'deals'],
    queryFn: () =>
      api<DealList>(
        `/api/v1/companies/${encodeURIComponent(companyId)}/deals?${pageQuery({ rows: 50 })}`,
      ),
  })

  const medications = useQuery({
    queryKey: ['companies', companyId, 'medications'],
    queryFn: () =>
      api<MedicationList>(`/api/v1/companies/${encodeURIComponent(companyId)}/medications`),
    enabled: creatingDeal,
  })

  const createDeal = useMutation({
    mutationFn: (body: DealCreateBody) =>
      api<Deal>(`/api/v1/companies/${encodeURIComponent(companyId)}/deals`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'deals'] })
      setCreatingDeal(false)
    },
  })

  const dealItems = deals.data?.data ?? []
  const dealTabs: TabItem<'new' | 'existing'>[] = [
    { value: 'new', label: 'Crear nuevo' },
    { value: 'existing', label: 'Agregar existente' },
  ]

  return (
    <div className="grid gap-3">
      <CollapsibleSection
        title="Pacientes"
        count={contacts.length}
        onAdd={!switching ? onGoToPatients : undefined}
      >
        {contacts.length ? (
          <div className="grid gap-2">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
            <button
              type="button"
              disabled={switching}
              onClick={onGoToPatients}
              className="text-tealmax mt-1 text-xs font-semibold hover:underline disabled:opacity-50"
            >
              Ver todos los pacientes asociados
            </button>
          </div>
        ) : (
          <EmptyRelation icon={<UserRound className="size-4" />} text="Sin pacientes asociados." />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Ofertas"
        count={dealItems.length}
        onAdd={() => {
          setDealTab('new')
          setCreatingDeal(true)
        }}
      >
        {dealItems.length ? (
          <div className="grid gap-2">
            {dealItems.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <EmptyRelation
            icon={<HandCoins className="size-4" />}
            text="Realiza un seguimiento de las oportunidades de ingresos asociadas a este registro."
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Archivos adjuntos"
        count={attachments.length}
        onAdd={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            if (files.length) setAttachments((current) => [...current, ...files])
            event.target.value = ''
          }}
        />
        {attachments.length ? (
          <div className="grid gap-2">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="border-border flex items-center gap-2.5 rounded-lg border p-3"
              >
                <span className="bg-tealmax/10 text-petroleo grid size-8 shrink-0 place-items-center rounded-full">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate text-sm font-semibold">{file.name}</p>
                  <p className="text-muted text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  aria-label="Quitar archivo"
                  onClick={() =>
                    setAttachments((current) => current.filter((_, i) => i !== index))
                  }
                  className="text-muted hover:text-red-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyRelation
            icon={<Paperclip className="size-4" />}
            text="Consulta los archivos adjuntos a las actividades o subidos a este registro."
          />
        )}
      </CollapsibleSection>

      {creatingDeal && (
        <Dialog
          title="Oferta"
          icon={<HandCoins className="size-5" />}
          compactHeader
          bodyClassName="pt-3"
          size="lg"
          onClose={() => setCreatingDeal(false)}
        >
          <Tabs tabs={dealTabs} value={dealTab} onChange={setDealTab} className="mb-3" />
          {dealTab === 'new' ? (
            <DealCreateForm
              companyName={companyName}
              medications={medications.data?.data ?? []}
              submitting={createDeal.isPending}
              onCancel={() => setCreatingDeal(false)}
              onSave={(body) => createDeal.mutateAsync(body).then(() => undefined)}
            />
          ) : (
            <ExistingDealPicker deals={dealItems} onDone={() => setCreatingDeal(false)} />
          )}
        </Dialog>
      )}
    </div>
  )
}
