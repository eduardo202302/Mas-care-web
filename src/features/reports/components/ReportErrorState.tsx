import { Button } from '@/components/ui/Button'

/** Error banner with retry, matching the pattern already used by BoardPage/TransfersPage. */
export function ReportErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 print:hidden"
    >
      <span>No pudimos cargar el informe. {message}</span>
      <Button type="button" className="h-8" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  )
}
