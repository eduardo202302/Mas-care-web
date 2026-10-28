import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthFrame } from './AccessPage'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/ui/PasswordField'
import { api, ApiError } from '@/lib/http'

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const resetToken = (location.state as { resetToken?: string } | null)
    ?.resetToken

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!resetToken) {
    return (
      <AuthFrame
        eyebrow="Enlace inválido"
        title="Paso no disponible"
        description="Debes verificar tu PIN antes de cambiar la contraseña."
      >
        <Link
          className="text-tealmax font-semibold hover:underline"
          to="/recuperar"
        >
          Volver al inicio de recuperación
        </Link>
      </AuthFrame>
    )
  }

  function validatePasswords() {
    if (newPassword !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.')
      return false
    }
    setConfirmError('')
    return true
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validatePasswords()) return
    setLoading(true)
    setError('')
    try {
      await api('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword }),
      })
      navigate('/acceso', {
        replace: true,
        state: { message: 'Contraseña actualizada. Inicia sesión.' },
      })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setError('Demasiados intentos. Inténtalo más tarde.')
        } else {
          setError(err.message)
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
      title="Nueva contraseña"
      description="Elige una contraseña segura de al menos 8 caracteres."
    >
      <form onSubmit={submit} className="grid gap-5">
        <PasswordField
          label="Nueva contraseña"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            setError('')
          }}
          placeholder="Mínimo 8 caracteres"
        />
        <PasswordField
          label="Confirmar contraseña"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setConfirmError('')
          }}
          onBlur={validatePasswords}
          placeholder="Repite tu contraseña"
          error={confirmError}
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
          {loading ? 'Guardando…' : 'Cambiar contraseña'}
        </Button>
      </form>
    </AuthFrame>
  )
}
