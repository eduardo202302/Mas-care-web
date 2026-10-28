const roleLabels: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador de farmacia',
  pharmacy_admin: 'Administrador de farmacia',
  pharmacist: 'Farmacéutico',
  operator: 'Operador/Auxiliar',
  assistant: 'Operador/Auxiliar',
  read_only: 'Solo lectura',
}

export function roleLabel(role: string) {
  return roleLabels[role] ?? role
}
