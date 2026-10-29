import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/http'

type Job = {
  name: string
  runs: number
  failures: number
  last_finished_at: string | null
  last_status: 'ok' | 'failed' | null
  last_error: string | null
  last_failure_at: string | null
  late: boolean
}

const when = (value: string | null) => (value ? new Date(value).toLocaleString('es') : 'Nunca')

function State({ job }: { job: Job }) {
  const [label, tone] = job.last_status === 'failed'
    ? ['Falló la última vez', 'bg-red-50 text-red-800']
    : job.late
      ? ['Atrasado', 'bg-amber-50 text-amber-900']
      : job.last_status === 'ok'
        ? ['Al día', 'bg-emerald-50 text-emerald-800']
        : ['Sin ejecuciones', 'bg-slate-100 text-slate-700']
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
}

/** Platform owner view of the background worker: when each job last ran and how many runs failed. */
export default function JobsPage() {
  const jobs = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api<{ data: Job[] }>('/api/v1/jobs'),
    refetchInterval: 30_000,
  })
  return (
    <div className="animate-in">
      <h1 className="font-display text-petroleo text-3xl font-bold tracking-tight">Trabajos en segundo plano</h1>
      <p className="text-muted mt-2 mb-6 text-sm">
        Si un trabajo aparece atrasado, revisa que el proceso del worker esté corriendo. Los fallos se reintentan solos; aquí ves los que ocurrieron.
      </p>
      {jobs.isError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">No pudimos cargar los trabajos. {jobs.error.message}</p>}
      {jobs.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-muted text-xs">
              <tr>
                <th className="px-4 py-3">Trabajo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Última ejecución</th>
                <th className="px-4 py-3">Ejecuciones</th>
                <th className="px-4 py-3">Fallos</th>
                <th className="px-4 py-3">Último fallo</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {(jobs.data?.data ?? []).map((job) => (
                <tr key={job.name}>
                  <td className="px-4 py-3 font-mono text-xs">{job.name}</td>
                  <td className="px-4 py-3"><State job={job} /></td>
                  <td className="px-4 py-3">{when(job.last_finished_at)}</td>
                  <td className="px-4 py-3">{job.runs}</td>
                  <td className="px-4 py-3">{job.failures}</td>
                  <td className="px-4 py-3">{job.failures ? `${when(job.last_failure_at)}${job.last_error ? ` (${job.last_error})` : ''}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
