import { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { PasswordField } from '@/components/ui/PasswordField'
import { authClient } from '@/lib/auth-client'
import { queryClient } from '@/lib/query-client'
import { authErrorMessage } from '@/lib/auth-errors'
import { CompanyBadge } from './CompanyBadge'

const REMEMBER_KEY = 'maxcare.remembered-email'

function readRememberedEmail() {
  try {
    return window.localStorage.getItem(REMEMBER_KEY) ?? ''
  } catch {
    return ''
  }
}

function writeRememberedEmail(remember: boolean, email: string) {
  try {
    if (remember) window.localStorage.setItem(REMEMBER_KEY, email)
    else window.localStorage.removeItem(REMEMBER_KEY)
  } catch {
    // Storage can be unavailable (private mode); remembering is best-effort.
  }
}

// The password is never kept by the app: it is handed to the browser's own
// password manager, which offers to save it and autofills it next time.
async function storeBrowserCredential(email: string, password: string) {
  try {
    const PasswordCredentialCtor = (
      window as unknown as {
        PasswordCredential?: new (data: {
          id: string
          password: string
        }) => Credential
      }
    ).PasswordCredential
    if (PasswordCredentialCtor && navigator.credentials) {
      await navigator.credentials.store(
        new PasswordCredentialCtor({ id: email, password }),
      )
    }
  } catch {
    // Unsupported browser or blocked by the user; saving is best-effort.
  }
}

export default function AccessPage() {
  const [email, setEmail] = useState(readRememberedEmail)
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refetch: refetchSession } = authClient.useSession()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const companyReference = searchParams.get('empresa')?.trim() ?? ''
  const successMessage = (location.state as { message?: string } | null)
    ?.message
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      })
      if (result.error) setError(authErrorMessage(result.error))
      else {
        const session = await authClient.getSession()
        if (session.error || !session.data) {
          setError(
            'La sesión no pudo confirmarse. Verifica que la API acepte cookies para este origen e inténtalo de nuevo.',
          )
        } else {
          writeRememberedEmail(rememberMe, email.trim())
          if (rememberMe) await storeBrowserCredential(email.trim(), password)
          // The session store updates asynchronously after sign-in; entering
          // /inicio before it does made RequireAuth bounce back to /acceso,
          // so the first attempt seemed to do nothing.
          await refetchSession()
          queryClient.clear()
          navigate('/inicio', { replace: true })
        }
      }
    } catch {
      setError(
        'No pudimos conectar con el servidor. Verifica que la API esté iniciada e inténtalo de nuevo.',
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthFrame
      title="Accede a tu espacio"
      badge={<CompanyBadge reference={companyReference} />}
    >
      <form onSubmit={submit} className="grid gap-5">
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@farmacia.com"
        />
        <PasswordField
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contraseña"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="accent-tealmax size-4 cursor-pointer"
          />
          <span className="text-ink">
            Recordar mi correo y mantener la sesión
          </span>
        </label>
        {successMessage && (
          <p
            role="status"
            className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
          >
            {successMessage}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="mt-1 w-full"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Link
          className="text-muted hover:text-tealmax text-sm hover:underline"
          to="/recuperar"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
      <p className="text-muted mt-4 text-center text-sm">
        ¿Aún no tienes una cuenta?{' '}
        <Link
          className="text-tealmax font-semibold hover:underline"
          to="/registro"
        >
          Crea una
        </Link>
      </p>
    </AuthFrame>
  )
}

export function AuthFrame({
  eyebrow,
  badge,
  title,
  description,
  children,
}: {
  eyebrow?: string
  badge?: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-modulos grid min-h-screen lg:grid-cols-[1fr_480px]">
      <section className="bg-petroleo relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -top-24 -right-24 size-96 rounded-full border border-white/10" />
        <div className="absolute -top-8 -right-8 size-64 rounded-full border border-white/10" />
        <Link to="/acceso" className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10">
            <HeartPulse className="text-cuidado size-5" />
          </span>
          <span className="font-display text-xl font-bold">MAS CARE</span>
        </Link>
        <div className="relative max-w-lg pb-8">
          <span className="mb-6 inline-block rounded-full border border-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-white/70">
            CUIDAR TAMBIÉN ES ORGANIZAR
          </span>
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-tight">
            Más tiempo para cuidar. Menos tiempo buscando.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/65">
            Una forma más simple de llevar el día a día de tu farmacia y
            acompañar a tu equipo.
          </p>
        </div>
        <p className="relative text-xs text-white/40">
          MAS CARE · Gestión de farmacias
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <Link
              to="/acceso"
              className="font-display text-petroleo flex items-center gap-2 text-xl font-bold"
            >
              <HeartPulse className="text-tealmax size-6" />
              MAS CARE
            </Link>
          </div>
          {badge}
          {eyebrow && (
            <p className="text-tealmax text-sm font-semibold">{eyebrow}</p>
          )}
          <h1
            className={`font-display text-petroleo text-2xl font-bold tracking-tight ${
              eyebrow ? 'mt-2' : ''
            }`}
          >
            {title}
          </h1>
          {description && (
            <p className="text-muted mt-2 text-sm leading-6">{description}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </div>
  )
}
