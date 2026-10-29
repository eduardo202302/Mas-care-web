import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { api } from '@/lib/http'

/** Sends one approved WhatsApp template to a number you type (for example your own phone) to check it. */
export function TemplateTestSendDialog({ templateId, templateName, onClose }: { templateId: string; templateName: string; onClose: () => void }) {
  const [phone, setPhone] = useState('')
  const send = useMutation({
    mutationFn: () =>
      api<{ sent: boolean }>(`/api/v1/message-templates/${encodeURIComponent(templateId)}/test-send`, {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim() }),
      }),
  })
  return (
    <Dialog
      title="Enviar prueba"
      description={`Envía «${templateName}» a un solo número, con datos de ejemplo. No toca a ningún paciente.`}
      onClose={onClose}
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (phone.trim().length >= 7) send.mutate()
        }}
      >
        <label className="grid gap-1 text-sm font-medium">
          Teléfono de prueba
          <input
            type="tel"
            inputMode="tel"
            placeholder="809 555 0123"
            value={phone}
            onChange={(event) => { setPhone(event.target.value); send.reset() }}
            className="border-border h-10 rounded-lg border bg-white px-3 text-sm"
          />
        </label>
        {send.isSuccess && <p role="status" className="text-sm text-emerald-800">Enviado. Revisa ese teléfono.</p>}
        {send.isError && <p role="alert" className="text-sm text-red-700">{send.error.message}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose}>Cerrar</Button>
          <Button type="submit" variant="primary" disabled={phone.trim().length < 7 || send.isPending}>
            {send.isPending ? 'Enviando…' : 'Enviar prueba'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
