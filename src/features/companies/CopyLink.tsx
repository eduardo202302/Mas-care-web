import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function CopyLinkButton({
  value,
  label = 'Copiar',
}: {
  value: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-8 shrink-0 px-2 text-xs"
      disabled={!value}
      onClick={copy}
    >
      {copied ? (
        <Check className="text-cuidado size-3.5" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? 'Copiado' : label}
    </Button>
  )
}

export function LinkField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-ink text-sm font-medium">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <input
          readOnly
          value={value || 'Se generará al guardar la compañía'}
          aria-label={label}
          onFocus={(event) => event.currentTarget.select()}
          className="border-border text-muted h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 font-mono text-xs outline-none"
        />
        <CopyLinkButton value={value} />
      </div>
    </div>
  )
}
