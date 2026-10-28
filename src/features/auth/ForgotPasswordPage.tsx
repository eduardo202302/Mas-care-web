import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthFrame } from './AccessPage'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { api, ApiError } from '@/lib/http'

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim() }),
      })
      navigate('/recuperar/pin', { state: { identifier: identifier.trim() } })
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError('Demasiados intentos. Inténtalo más tarde.')
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
      title="¿Olvidaste tu contraseña?"
      description="Ingresa tu usuario, correo o teléfono. Luego te pediremos tu PIN de recuperación."
    >
      <form onSubmit={submit} className="grid gap-5">
        <TextField
          label="Usuario, correo electrónico o teléfono"
          required
          minLength={1}
          maxLength={254}
          autoComplete="off"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value)
            setError('')
          }}
          placeholder="ej. farmacia_central"
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
          {loading ? 'Continuando…' : 'Continuar'}
        </Button>
      </form>
      <p className="text-muted mt-6 text-center text-sm">
        <Link
          className="text-tealmax font-semibold hover:underline"
          to="/acceso"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </AuthFrame>
  )
}
