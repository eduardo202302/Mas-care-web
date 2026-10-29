import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/ui/PasswordField'
import { authClient } from '@/lib/auth-client'
import { api } from '@/lib/http'
import { useMe } from '@/lib/permissions'

type Profile = {
  id: string
  name: string
  username: string | null
  email: string
  emailVerified?: boolean
  phone: string | null
  roleName: string | null
  role: string
  branches: { id: string; name: string }[]
  pin?: string | null
  pinUpdatedAt?: string | null
}

const MIN_PASSWORD = 8

function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const mismatch = confirm.length > 0 && next !== confirm
  const ready = current.length > 0 && next.length >= MIN_PASSWORD && next === confirm

  async function submit() {
    setState('saving')
    setError(null)
    // Other devices are signed out: a changed password should end any session that was not yours.
    const result = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true })
    if (result.error) {
      setState('idle')
      setError('No pudimos cambiar la contraseña. Revisa la contraseña actual e inténtalo de nuevo.')
      return
    }
    setCurrent('')
    setNext('')
    setConfirm('')
    setState('done')
  }

  return (
    <section className="border-border rounded-xl border bg-white p-5">
      <h2 className="text-petroleo mb-1 font-semibold">Cambiar contraseña</h2>
      <p className="text-muted mb-4 text-xs">Al cambiarla se cierra tu sesión en los demás dispositivos.</p>
      <form
        className="grid max-w-md gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) void submit()
        }}
      >
        <PasswordField label="Contraseña actual" autoComplete="current-password" required value={current} onChange={(e) => { setCurrent(e.target.value); setState('idle') }} />
        <PasswordField label="Nueva contraseña" autoComplete="new-password" required minLength={MIN_PASSWORD} maxLength={128} value={next} onChange={(e) => { setNext(e.target.value); setState('idle') }} />
        <PasswordField
          label="Repite la nueva contraseña"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setState('idle') }}
          error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
        />
        {next.length > 0 && next.length < MIN_PASSWORD && <p className="text-xs text-red-700">Usa al menos {MIN_PASSWORD} caracteres.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {state === 'done' && <p role="status" className="text-sm text-emerald-800">Contraseña cambiada.</p>}
        <div>
          <Button type="submit" variant="primary" disabled={!ready || state === 'saving'}>
            {state === 'saving' ? 'Guardando…' : 'Cambiar contraseña'}
          </Button>
        </div>
      </form>
    </section>
  )
}

function VerifyEmail({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  async function resend() {
    setState('sending')
    const result = await authClient.sendVerificationEmail({ email, callbackURL: window.location.href })
    setState(result.error ? 'error' : 'sent')
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <span>Tu correo aún no está verificado.</span>
      <Button className="h-8 px-3 text-xs" onClick={() => void resend()} disabled={state === 'sending' || state === 'sent'}>
        {state === 'sent' ? 'Enlace enviado' : 'Enviar enlace de verificación'}
      </Button>
      {state === 'error' && <span role="alert" className="text-red-700">No pudimos enviarlo. Inténtalo más tarde.</span>}
    </div>
  )
}

/** The signed-in user own data, recovery PIN and password. Name, email and phone are changed by an administrator. */
export default function ProfilePage() {
  const { data: me } = useMe()
  const [showPin, setShowPin] = useState(false)
  const profile = useQuery({
    queryKey: ['profile', me?.user.id],
    queryFn: () => api<Profile>(`/api/v1/users/${encodeURIComponent(me!.user.id)}`),
    enabled: Boolean(me),
  })
  if (!me) return null
  const data = profile.data
  const rows: [string, string | null | undefined][] = [
    ['Nombre', data?.name ?? me.user.name],
    ['Correo', data?.email ?? me.user.email],
    ['Usuario', data?.username],
    ['Teléfono', data?.phone],
    ['Rol', data?.roleName ?? me.roleName ?? me.role],
    ['Organización', me.organization.name],
    ['Sucursales', data?.branches.length ? data.branches.map((b) => b.name).join(', ') : 'Todas'],
  ]

  return (
    <div className="animate-in grid max-w-3xl gap-4">
      <div>
        <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted mt-2 text-sm">Tus datos de acceso. Para cambiar el nombre, el correo o el teléfono, pídeselo a un administrador.</p>
      </div>

      <section className="border-border rounded-xl border bg-white p-5">
        <h2 className="text-petroleo mb-4 font-semibold">Datos</h2>
        {data?.emailVerified === false && <div className="mb-4"><VerifyEmail email={data.email} /></div>}
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted">{label}</dt>
              <dd className="mt-0.5">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-border rounded-xl border bg-white p-5">
        <h2 className="text-petroleo mb-1 font-semibold">PIN de recuperación</h2>
        <p className="text-muted mb-3 text-xs">
          Si olvidas tu contraseña, este PIN de 6 dígitos te deja crear una nueva. Sirve una sola vez: después de usarlo se genera otro, y
          tras 5 intentos fallidos se bloquea 15 minutos. Guárdalo en un lugar seguro y no lo compartas.
        </p>
        {profile.isError ? (
          <p role="alert" className="text-sm text-red-700">No pudimos cargar tu PIN. {profile.error.message}</p>
        ) : data?.pin ? (
          <div className="flex flex-wrap items-center gap-3">
            <code aria-label="PIN de recuperación" className="bg-surface rounded-lg px-3 py-2 font-mono text-lg tracking-widest">
              {showPin ? data.pin : '••••••'}
            </code>
            <Button className="h-9" onClick={() => setShowPin((value) => !value)}>
              {showPin ? 'Ocultar' : 'Mostrar'}
            </Button>
            {data.pinUpdatedAt && <span className="text-muted text-xs">Generado el {new Date(data.pinUpdatedAt).toLocaleDateString('es')}</span>}
          </div>
        ) : (
          <p className="text-muted text-sm">Todavía no tienes PIN. Pide a un administrador que te genere uno.</p>
        )}
      </section>

      <ChangePassword />
    </div>
  )
}
