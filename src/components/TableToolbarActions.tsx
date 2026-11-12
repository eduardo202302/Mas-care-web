import { useQuery } from '@tanstack/react-query'
import { Download, Printer } from 'lucide-react'
import { ExportButton, type ExportEntity } from '@/components/ExportButton'
import { Button } from '@/components/ui/Button'
import { authClient } from '@/lib/auth-client'
import { api } from '@/lib/http'
import { useCan } from '@/lib/permissions'
import { printTable } from '@/lib/print-table'
import { downloadTableXlsx } from '@/lib/xlsx-table'
import type { paths } from '@/lib/api-types'
import { useUiStore } from '@/stores/ui-store'

type BranchList =
  paths['/api/v1/branches']['get']['responses'][200]['content']['application/json']

/**
 * Imprimir + Exportar a Excel al final de la barra de filtros. Imprime (y, si
 * no hay `exportEntity`, exporta) las filas que se ven en pantalla; con
 * `exportEntity` el Excel lo genera el servidor con todos los filtros.
 */
export function TableToolbarActions({
  title,
  headers,
  rows,
  filename,
  branchScoped = false,
  exportEntity,
  exportFilters,
}: {
  title: string
  headers: string[]
  rows: string[][]
  filename: string
  branchScoped?: boolean
  exportEntity?: ExportEntity
  exportFilters?: { q?: string; branchId?: string; status?: string }
}) {
  const canExport = useCan('export:csv')
  const activeOrganization = authClient.useActiveOrganization()
  const organizations = authClient.useListOrganizations()
  const activeBranchId = useUiStore((state) => state.activeBranchId)
  const branches = useQuery({
    queryKey: ['branches'],
    queryFn: () => api<BranchList>('/api/v1/branches'),
    enabled: branchScoped,
  })
  const company =
    activeOrganization.data?.name ?? organizations.data?.[0]?.name ?? ''
  const branch = !branchScoped
    ? undefined
    : activeBranchId && activeBranchId !== 'all'
      ? ((branches.data?.data ?? []).find((b) => b.id === activeBranchId)
          ?.name ?? '')
      : 'Todas las Sucursales'
  const user = authClient.useSession().data?.user

  return (
    <div className="ml-auto flex flex-wrap items-center gap-2">
      <Button
        type="button"
        className="hover:bg-[#c3e9cf]"
        disabled={!rows.length}
        aria-label={`Imprimir ${title}`}
        onClick={() =>
          printTable({
            company,
            branch,
            user: user?.name || user?.email,
            title,
            headers,
            rows,
          })
        }
      >
        <Printer className="size-4" />
        Imprimir
      </Button>
      {exportEntity ? (
        <ExportButton
          entity={exportEntity}
          filters={exportFilters}
          defaultFormat="xlsx"
          label="Exportar a Excel"
        />
      ) : (
        canExport && (
          <Button
            type="button"
            className="hover:bg-[#c3e9cf]"
            disabled={!rows.length}
            onClick={() =>
              downloadTableXlsx({
                company,
                branch,
                title,
                headers,
                rows,
                filename,
              })
            }
          >
            <Download className="size-4" />
            Exportar a Excel
          </Button>
        )
      )}
    </div>
  )
}
