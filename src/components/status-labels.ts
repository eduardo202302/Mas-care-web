export const statusLabels = [
  'Al día',
  'Próxima reposición',
  'Vence pronto',
  'Retiro pendiente',
  'Vencido',
  'Receta por renovar',
] as const
export type StatusLabel = (typeof statusLabels)[number]
