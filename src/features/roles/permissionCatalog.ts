export type PermissionGroup = {
  title: string
  permissions: { action: string; label: string }[]
}

// Every permission the API understands, grouped for the Roles screen. The server is the
// source of truth and rejects anything it does not know, so keep this in step with
// `actions` in max-care-api (src/domain/permissions.ts).
export const permissionGroups: PermissionGroup[] = [
  {
    title: 'Pacientes',
    permissions: [
      { action: 'patients:read', label: 'Ver pacientes' },
      { action: 'patients:write', label: 'Crear y editar pacientes' },
      { action: 'patients:archive', label: 'Archivar pacientes' },
      {
        action: 'patient:transfer',
        label: 'Transferir pacientes entre sucursales',
      },
    ],
  },
  {
    title: 'Tratamientos y Medicamentos',
    permissions: [
      { action: 'treatments:read', label: 'Ver tratamientos' },
      { action: 'treatments:write', label: 'Crear y editar tratamientos' },
      {
        action: 'treatments:manage',
        label: 'Gestionar el estado de los tratamientos',
      },
      { action: 'medications:read', label: 'Ver medicamentos' },
      { action: 'medications:write', label: 'Crear y editar medicamentos' },
    ],
  },
  {
    title: 'Dosis e Inventario',
    permissions: [
      { action: 'dose:log', label: 'Registrar tomas' },
      { action: 'dose:correct', label: 'Corregir tomas' },
      { action: 'inventory:purchase', label: 'Registrar compras externas' },
      { action: 'inventory:adjust', label: 'Ajustar el inventario' },
      { action: 'inventory:settings:write', label: 'Configurar el inventario' },
      { action: 'stock:mark', label: 'Marcar existencias' },
    ],
  },
  {
    title: 'Tablero y Panel',
    permissions: [
      { action: 'dashboard:read', label: 'Ver el panel del día' },
      { action: 'cycle:move', label: 'Mover ciclos en el tablero' },
      {
        action: 'cycle:edit-date',
        label: 'Editar la fecha esperada de un ciclo',
      },
    ],
  },
  {
    title: 'Incidencias y Tareas',
    permissions: [
      { action: 'incident:create', label: 'Crear incidencias' },
      { action: 'incident:move', label: 'Mover incidencias' },
      { action: 'incident:resolve', label: 'Resolver incidencias' },
      { action: 'tasks:read', label: 'Ver tareas' },
      { action: 'tasks:write', label: 'Crear y editar tareas' },
    ],
  },
  {
    title: 'Avisos y Plantillas',
    permissions: [
      { action: 'outbox:view', label: 'Ver avisos enviados' },
      { action: 'outbox:retry', label: 'Reintentar avisos' },
      { action: 'inbound:assign', label: 'Asignar mensajes entrantes' },
      { action: 'automation:manage', label: 'Gestionar automatizaciones' },
      { action: 'templates:read', label: 'Ver plantillas' },
      { action: 'templates:write', label: 'Crear y editar plantillas' },
    ],
  },
  {
    title: 'Catálogo Médico',
    permissions: [
      { action: 'doctors:read', label: 'Ver médicos' },
      { action: 'doctors:write', label: 'Crear y editar médicos' },
      { action: 'specialties:read', label: 'Ver especialidades' },
      { action: 'specialties:write', label: 'Crear y editar especialidades' },
      { action: 'medical-centers:read', label: 'Ver centros médicos' },
      {
        action: 'medical-centers:write',
        label: 'Crear y editar centros médicos',
      },
      { action: 'health-conditions:read', label: 'Ver condiciones de salud' },
      {
        action: 'health-conditions:write',
        label: 'Crear y editar condiciones de salud',
      },
    ],
  },
  {
    title: 'Organización',
    permissions: [
      { action: 'branches:read', label: 'Ver sucursales' },
      { action: 'branches:write', label: 'Crear y editar sucursales' },
      { action: 'settings:read', label: 'Ver la configuración' },
      { action: 'settings:write', label: 'Cambiar la configuración' },
      { action: 'imports:write', label: 'Importar datos' },
      { action: 'export:csv', label: 'Exportar a CSV' },
      { action: 'audit:read', label: 'Ver la auditoría' },
    ],
  },
  {
    title: 'Usuarios y Roles',
    permissions: [
      { action: 'users:write', label: 'Administrar usuarios' },
      { action: 'roles:read', label: 'Ver roles' },
      { action: 'roles:write', label: 'Administrar roles' },
    ],
  },
]

export const allPermissionActions = permissionGroups.flatMap((group) =>
  group.permissions.map((permission) => permission.action),
)
