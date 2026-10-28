import { buildMenuTree, menuIcon, type MenuItemDto } from '@/lib/menu'
import { cn } from '@/lib/cn'
import { setVisible, type GrantMap } from './grants'

const rowClass = 'grid grid-cols-[1fr_4.5rem] items-center px-3 py-2'

function Check({
  checked,
  indeterminate = false,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      disabled={disabled}
      ref={(element) => {
        if (element) element.indeterminate = indeterminate
      }}
      onChange={(event) => onChange(event.target.checked)}
      className="accent-tealmax size-4 cursor-pointer disabled:cursor-not-allowed"
    />
  )
}

/**
 * Checkbox tree of the menu catalog. Group rows toggle all their children;
 * a checked screen is visible to the role.
 */
export function MenuPermissionTree({
  catalog,
  value,
  onChange,
  disabled = false,
}: {
  catalog: MenuItemDto[]
  value: GrantMap
  onChange: (next: GrantMap) => void
  disabled?: boolean
}) {
  const tree = buildMenuTree(catalog)

  function toggleGroup(children: MenuItemDto[], checked: boolean) {
    let next = value
    for (const child of children) next = setVisible(next, child.id, checked)
    onChange(next)
  }

  function renderLeaf(item: MenuItemDto, nested: boolean) {
    const Icon = menuIcon(item.icon)
    return (
      <div
        key={item.id}
        role="row"
        className={cn(rowClass, 'border-border border-t')}
      >
        <span
          className={cn(
            'text-ink flex items-center gap-2 text-sm',
            nested && 'pl-6',
          )}
        >
          <Icon className="text-muted size-4" aria-hidden="true" />
          {item.label}
        </span>
        <span className="flex justify-center">
          <Check
            checked={Boolean(value[item.id]?.canView)}
            disabled={disabled}
            label={`Ver ${item.label}`}
            onChange={(checked) =>
              onChange(setVisible(value, item.id, checked))
            }
          />
        </span>
      </div>
    )
  }

  return (
    <div
      role="table"
      aria-label="Pantallas permitidas"
      className="border-border overflow-hidden rounded-xl border bg-white"
    >
      <div
        role="row"
        className={cn(
          rowClass,
          'bg-surface text-muted py-2.5 text-xs font-semibold tracking-wide uppercase',
        )}
      >
        <span>Pantalla</span>
        <span className="text-center">Acceso</span>
      </div>
      {tree.map((node) => {
        if (!node.children.length) return renderLeaf(node, false)
        const viewCount = node.children.filter(
          (child) => value[child.id]?.canView,
        ).length
        const Icon = menuIcon(node.icon)
        return (
          <div key={node.id} role="rowgroup">
            <div
              role="row"
              className={cn(rowClass, 'bg-surface/50 border-border border-t')}
            >
              <span className="text-petroleo flex items-center gap-2 text-sm font-semibold">
                <Icon className="text-tealmax size-4" aria-hidden="true" />
                {node.label}
              </span>
              <span className="flex justify-center">
                <Check
                  checked={viewCount === node.children.length}
                  indeterminate={
                    viewCount > 0 && viewCount < node.children.length
                  }
                  disabled={disabled}
                  label={`Ver todo ${node.label}`}
                  onChange={(checked) => toggleGroup(node.children, checked)}
                />
              </span>
            </div>
            {node.children.map((child) => renderLeaf(child, true))}
          </div>
        )
      })}
    </div>
  )
}
