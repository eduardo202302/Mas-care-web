# MAS CARE Web

SPA de gestión para farmacias que llevan tratamientos de uso continuo: React 19, Vite, TanStack Query, React Hook Form, Zod y Tailwind. Consume `max-care-api`.

## Requisitos

- Node.js 22+
- pnpm 10
- `max-care-api` ejecutándose en local

## Arranque local

```powershell
Copy-Item .env.example .env
# Ajusta VITE_API_URL a la URL local de max-care-api (por defecto http://localhost:3000)
pnpm install
pnpm gen:api
pnpm dev
```

La app queda disponible en `http://localhost:5173`. Better Auth usa `${VITE_API_URL}/api/auth`; el cliente de recursos llama a `/api/v1`. La API debe habilitar CORS para el origen de Vite y permitir credenciales.

## Comandos

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`
- `pnpm test:e2e` corre el flujo Playwright contra la API local configurada.
- `pnpm gen:api` genera `src/lib/api-types.ts` directamente desde `/api/v1/openapi.json`. Hay que ejecutarlo con la API levantada; hoy el archivo no incluye los endpoints añadidos en las ampliaciones recientes y esas pantallas usan tipos manuales.

## Pantallas

El menú lo define la API (`/api/v1/menu`) según el rol; las rutas que el rol no incluye responden 404 en pantalla.

- `/inicio`, `/panel-global`: panel del día y panel consolidado.
- `/tablero`: Kanban con arrastre (ratón, táctil y teclado), movimiento optimista, conflicto `409`, modal `422 STOCK_OUT_OF_STOCK` y vista Tabla (ver abajo). Filtros en la URL; Zustand solo recuerda la última vista.
- `/incidencias`, `/tareas`, `/traspasos`, `/informes`, `/companias`.
- `/pacientes` y `/pacientes/:id`: lista y ficha en tres paneles. `/pacientes/:id/tratamientos/:id`: ficha del tratamiento con la misma estructura.
- `/medicamentos`.
- Ajustes: `/ajustes/usuarios`, `sucursales`, `plantillas`, `umbrales`, `roles`, `menu`, `existencias`, `etapas`, `propiedades` y `automatizacion`.

## Ampliaciones recientes

**Tablero**

- Cada columna muestra total, vencidas y cuántas vencen en 3 días. Cada tarjeta muestra responsable y próxima acción (Avisar o Marcar entregado).
- «+ Nuevo ciclo» en cada columna abierta crea un ciclo a partir de un tratamiento existente sin ciclo abierto. No hay ciclos sin tratamiento.
- La columna «Entregado / No retirado» no admite movimiento y lo explica en pantalla: un ciclo cerrado ya registró la entrega o el no retiro.
- Los nombres, colores y orden de las columnas salen de `/ajustes/etapas`.

**Vista Tabla** (Tablero y Pacientes)

- Columnas configurables: mostrar, ocultar y reordenar, guardado por usuario en el servidor.
- Filtros de creación, actividad, fecha prevista y fin de cobertura; orden de hasta tres niveles.
- Solo Tablero: filtros por sucursal, medicamento, responsable, paciente y tratamiento combinables con Y/O; vistas guardadas con nombre; acciones por lote con casillas (asignar responsable, cambiar etapa, crear tareas y archivar) siempre con diálogo de confirmación.
- Filtro por una propiedad personalizada en ambas tablas.

**Fichas** (`PatientDetailPage`, `TreatmentDetailPage`)

- Izquierda: propiedades y datos clave. Centro: pestañas Historial / Tratamientos (Ciclos en el tratamiento) y botones Nota, Llamada, Correo y Reunión; Correo y Reunión solo registran, no envían. Derecha: asociaciones (tratamientos activos, tareas e incidencias abiertas, cuidadores, sucursal).
- Menú «Acciones»: Editar, Trasladar, Duplicar (sin tratamientos, con aviso), Archivar, Ver historial completo y Ver todas las propiedades.

**Importar y exportar**

- Botones «Importar» y «Exportar» en Pacientes y Medicamentos; «Exportar» también en la Tabla del Tablero. La importación sube un CSV, mapea columnas, valida fila por fila en una vista previa y solo guarda tras confirmar. La exportación (CSV o XLSX) deja elegir columnas y queda auditada. Exportar requiere `export:csv`.

**Automatizaciones** (`/ajustes/automatizacion`)

- Interruptor general más cuatro reglas activables por separado. El aviso superior solo desaparece con el interruptor encendido y al menos una regla activa, y entonces lista cuáles corren. Desde la ficha del paciente se puede inscribir manualmente en una regla activa. Ninguna regla envía mensajes a pacientes.

**Propiedades personalizadas** (`/ajustes/propiedades`)

- Crear, editar, archivar y borrar propiedades de pacientes y tratamientos. Aparecen en los formularios, en la ficha, en «Todas las propiedades» y como filtro de tabla. La validación está duplicada en `src/lib/custom-properties-core.ts`, copia de `max-care-api/src/domain/customProperties.ts`; si cambias una, cambia la otra. La API es la fuente de verdad.

**Desarrollo**

- La página de componentes `/dev/chips` y su enlace solo existen con `import.meta.env.DEV`.

## Pendientes conocidos

- Las etapas del tablero no se pueden añadir ni borrar, solo renombrar, recolorear y reordenar.
- Pacientes no tiene filtros por asociación ni acciones por lote.
- Las propiedades personalizadas no se pueden reordenar desde la pantalla ni usar aún en importación, exportación o vistas guardadas.
- «Seleccionar todos» del lote marca solo las filas cargadas.
- Mi perfil no existe: se quitó el botón por no tener contenido.
- No se ha revisado en navegador ni se han ejecutado los e2e de Playwright con los cambios recientes. Hay tests de unidad nuevos para la tabla de ciclos; las demás pantallas nuevas no tienen tests de interfaz.
- Hay que regenerar `src/lib/api-types.ts` (ver arriba).

Detalle de la Fase 2 (árbol de componentes y puerta de salida) en [`docs/phase2-web.md`](docs/phase2-web.md).

## Publicación

El proyecto no usa Docker. `pnpm build` genera la carpeta `dist/` con archivos estáticos que puedes servir desde cualquier hosting estático. `VITE_API_URL` queda incorporada en el bundle durante el build, como corresponde a una variable Vite pública, así que defínela antes de construir (`VITE_API_URL=https://api.ejemplo.com pnpm build`).

Como es una SPA con React Router, el servidor debe devolver `index.html` para cualquier ruta que no sea un archivo (fallback). Sin esa regla, recargar `/pacientes` da 404. En Netlify, Vercel o Cloudflare Pages se configura en el panel o en un archivo de reglas; en Nginx, con `try_files $uri $uri/ /index.html;`.
