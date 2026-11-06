import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FormActions } from '@/components/ui/FormActions'
import { TextField } from '@/components/ui/TextField'
import { api } from '@/lib/http'

/** Sends one approved WhatsApp template to a number you type (for example your own phone) to check it. */
export function TemplateTestSendDialog({
  templateId,
  templateName,
  onClose,
}: {
  templateId: string
  templateName: string
  onClose: () => void
}) {
  const [phone, setPhone] = useState('')
  const send = useMutation({
    mutationFn: () =>
      api<{ sent: boolean }>(
        `/api/v1/message-templates/${encodeURIComponent(templateId)}/test-send`,
        {
          method: 'POST',
          body: JSON.stringify({ phone: phone.trim() }),
        },
      ),
  })
  return (
    <Dialog
      title="Enviar prueba"
      description={`Envía «${templateName}» a un solo número, con datos de ejemplo. No toca a ningún paciente.`}
      onClose={onClose}
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (phone.trim().length >= 7) send.mutate()
        }}
      >
        <TextField
          label="Teléfono de prueba"
          type="tel"
          inputMode="tel"
          placeholder="809 555 0123"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value)
            send.reset()
          }}
        />
        {send.isSuccess && (
          <p role="status" className="text-sm text-emerald-800">
            Enviado. Revisa ese teléfono.
          </p>
        )}
        {send.isError && (
          <p role="alert" className="text-sm text-red-700">
            {send.error.message}
          </p>
        )}
        <FormActions>
          <Button type="button" className="w-full sm:w-auto" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full sm:w-auto"
            disabled={phone.trim().length < 7 || send.isPending}
          >
            {send.isPending ? 'Enviando…' : 'Enviar prueba'}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  )
}
