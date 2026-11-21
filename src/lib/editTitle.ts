/** Título de edición: "Editar <tipo> <nombre>"; sin nombre queda "Editar <tipo>". */
export function editTitle(type: string, name?: string | null): string {
  const label = name?.trim()
  return label ? `Editar ${type} ${label}` : `Editar ${type}`
}
