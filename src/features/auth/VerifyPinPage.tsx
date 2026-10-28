import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthFrame } from './AccessPage'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { api, ApiError } from '@/lib/http'

export default function VerifyPinPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const identifier = (location.state as { identifier?: string } | null)
    ?.identifier

  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!identifier) {
    return (
      <AuthFrame
        eyebrow="Enlace inválido"
        title="Paso no disponible"
        description="Debes ingresar tu identificador antes de continuar."
      >
        <Link
          className="text-tealmax font-semibold hover:underline"
          to="/recuperar"
        >
          Volver a recuperación
        </Link>
      </AuthFrame>
    )
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{6}$/.test(pin)) {
      setError('El PIN debe ser exactamente 6 dígitos numéricos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await api<{ resetToken: string; expiresAt: string }>(
        '/api/v1/auth/verify-pin',
        {
          method: 'POST',
          body: JSON.stringify({ identifier, pin }),
        },
      )
      navigate('/recuperar/nueva-contrasena', {
        state: { resetToken: response.resetToken },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Demasiados intentos. Inténtalo más tarde.')
        } else {
          setError('PIN incorrecto o bloqueado.')
        }
      } else {
        setError('No pudimos conectar con el servidor. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="Recupera tu acceso"
      title="Ingresa tu PIN"
      description="Ingresa el PIN de 6 dígitos que te entregó tu farmacia. Si no lo recuerdas, pídelo a un administrador."
    >
      <form onSubmit={submit} className="grid gap-5">
        <TextField
          label="PIN de recuperación"
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            setPin(value)
            setError('')
          }}
          placeholder="000000"
          className="text-center font-mono text-lg tracking-[0.5em]"
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
          disabled={loading || pin.length !== 6}
          className="mt-1 w-full"
        >
          {loading ? 'Verificando…' : 'Verificar PIN'}
        </Button>
      </form>
      <p className="text-muted mt-6 text-center text-sm">
        ¿No sabes tu PIN?{' '}
        <Link
          className="text-tealmax font-semibold hover:underline"
          to="/recuperar"
        >
          Volver a empezar
        </Link>
      </p>
    </AuthFrame>
  )
}
