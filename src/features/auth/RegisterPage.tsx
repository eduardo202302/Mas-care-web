import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthFrame } from './AccessPage'
import { CompanyBadge } from './CompanyBadge'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { PasswordField } from '@/components/ui/PasswordField'
import { api, ApiError } from '@/lib/http'
import { authClient } from '@/lib/auth-client'
import { queryClient } from '@/lib/query-client'

type RegisterValues = {
  name: string
  username: string
  email: string
  phone: string
  password: string
}

type RegisterBody = RegisterValues & {
  organizationName: string
  companyPin?: string
  companyToken?: string
}

type FieldErrors = Partial<Record<keyof RegisterBody, string>>

export default function RegisterPage() {
  const [values, setValues] = useState<RegisterValues>({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refetch: refetchSession } = authClient.useSession()
  const [searchParams] = useSearchParams()
  const companyReference = searchParams.get('empresa')?.trim() ?? ''

  const change =
    (key: keyof RegisterValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [key]: event.target.value })
      if (fieldErrors[key]) setFieldErrors({ ...fieldErrors, [key]: undefined })
    }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})
    try {
      const body: RegisterBody = {
        ...values,
        organizationName: `Farmacia de ${values.name.trim()}`.slice(0, 120),
        ...(companyReference
          ? /^\d{6}$/.test(companyReference)
            ? { companyPin: companyReference }
            : { companyToken: companyReference }
          : {}),
      }
      await api('/api/v1/register', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const session = await authClient.getSession()
      if (session.error || !session.data) {
        setError('Cuenta creada. Inicia sesión para continuar.')
        navigate('/acceso', { replace: true })
        return
      }
      // Wait for the session store before entering a protected route.
      await refetchSession()
      queryClient.clear()
      navigate('/inicio', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Demasiados intentos de registro. Inténtalo más tarde.')
          return
        }
        const fields = err.fields as FieldErrors | undefined
        if (fields && typeof fields === 'object') {
          setFieldErrors(fields)
          return
        }
        setError(err.message)
      } else {
        setError('No pudimos conectar con el servidor. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      title="Crea tu perfil"
      badge={<CompanyBadge reference={companyReference} />}
    >
      <form onSubmit={submit} className="grid gap-3">
        <TextField
          label="Nombre completo"
          required
          minLength={1}
          maxLength={120}
          autoComplete="name"
          value={values.name}
          onChange={change('name')}
          placeholder="Nombre y apellido"
          error={fieldErrors.name}
        />
        <TextField
          label="Nombre de usuario"
          required
          minLength={3}
          maxLength={40}
          autoComplete="username"
          value={values.username}
          onChange={change('username')}
          placeholder="ej. farmacia_central"
          pattern="^[a-zA-Z0-9_.\-]+$"
          title="Solo letras, números, puntos, guiones y guiones bajos"
          error={fieldErrors.username}
        />
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={values.email}
          onChange={change('email')}
          placeholder="tu@farmacia.com"
          error={fieldErrors.email}
        />
        <TextField
          label="Móvil"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          minLength={7}
          maxLength={20}
          value={values.phone}
          onChange={change('phone')}
          placeholder="+57 311 123 4567"
          error={fieldErrors.phone}
        />
        <PasswordField
          label="Contraseña"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={values.password}
          onChange={change('password')}
          placeholder="Mínimo 8 caracteres"
          error={fieldErrors.password}
        />
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
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="text-muted mt-6 text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link
          className="text-tealmax font-semibold hover:underline"
          to="/acceso"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthFrame>
  )
}
