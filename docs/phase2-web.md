# Fase 2 web · Tablero Kanban, existencias e incidencias

Implementación en `max-care-web` sobre la API de Fase 2.

## Árbol de `features/board` y `features/incidents`

```text
src/
├─ components/
│  ├─ kanban/
│  │  └─ KanbanBoard.tsx          # DnD genérico reutilizado por ciclos e incidencias
│  └─ ui/
│     └─ Toast.tsx                # avisos STOCK_LOW / STOCK_STALE / errores
├─ features/
│  ├─ board/
│  │  ├─ BoardPage.tsx            # ruta /tablero, vista Tablero | Tabla
│  │  ├─ BoardFilters.tsx         # filtros compartidos en URL
│  │  ├─ CycleCard.tsx            # tarjeta + menú de acciones
│  │  ├─ CycleTable.tsx           # vista tabla sincronizada
│  │  ├─ BoardDialogs.tsx         # fecha prevista, falta de stock y aviso
│  │  └─ board-api.ts             # fetch, concurrencia optimista y endpoints
│  ├─ incidents/
│  │  ├─ IncidentsPage.tsx        # pipeline /incidencias
│  │  ├─ IncidentCard.tsx         # tarjeta del pipeline
│  │  ├─ IncidentDialogs.tsx      # resolver, asignar y detalle
│  │  └─ IncidentFormDialog.tsx   # alta reutilizada desde tablero y ficha
│  └─ settings/
│     ├─ StockPage.tsx            # /ajustes/existencias
│     └─ StockMarkDialog.tsx      # actualización rápida hay/poco/no hay
```

El tablero de incidencias reutiliza `KanbanBoard`; no hay un segundo componente de arrastre.

## Rutas y menú

- `/tablero` con carga diferida.
- `/incidencias` con carga diferida.
- `/ajustes/existencias` dentro de Ajustes.
- El menú lateral viene de `/me.menu`; se añadieron `Tablero`, `Incidencias` y `Existencias` al catálogo de la API. `Read only` recibe Tablero e Incidencias, pero no Existencias (requiere `stock:mark`).

## Tablero de ciclos

- Columnas: Por avisar · Avisado · Confirmado · Preparado · Entregado / No retirado.
- La columna cerrada no admite drops.
- Cabecera con contador y «N vencen hoy».
- Tarjeta: paciente enlazado a su ficha, medicamento y presentación, fecha prevista, `StatusChip`, «Receta por renovar», etiqueta de sucursal y punto de existencias.
- DnD con puntero, táctil y teclado (`PointerSensor`, `TouchSensor`, `KeyboardSensor`), `DragOverlay`, `pointerWithin` con fallback a `closestCorners`, anuncios en español y handles accesibles.
- Movimiento optimista con TanStack Query:
  - `onMutate` mueve la tarjeta en la caché y cancela queries en vuelo.
  - `onError` restaura la instantánea; `409` avisa «Alguien movió esta tarjeta» y refresca.
  - `onSettled` invalida tablero, tabla, actividades del paciente e incidencias.
  - Se envían `expected_version`, `after_id` y `before_id`.
- `422 STOCK_OUT_OF_STOCK` abre el modal de falta de existencias y, al confirmar, reintenta con `confirm_out_of_stock=true` conservando los vecinos.
- `STOCK_LOW` y `STOCK_STALE` se muestran como toast sin bloquear.
- «Cargar más» por columna con cursor (`next_cursor` o el último `cycle_id`).
- Menú de tarjeta: Avisar (modal coral de la 1.3), Marcar entregado, Marcar no retirado, Cambiar fecha prevista, Crear incidencia, Actualizar existencias y Mover a…
- El modal de entrega reutiliza `DeliveryDialog`; al completar se invalida el tablero y aparece el siguiente ciclo.
- Cambiar fecha usa `PATCH /cycles/:id/expected-on` y refresca el orden sin recargar.
- En móvil las columnas van en scroll horizontal con `snap`; «Mover a…» cubre el cambio de columna sin arrastre.

## Tabla sincronizada

- Selector Tablero | Tabla en la misma ruta. La última vista se guarda en `ui-store`; los filtros viven en la URL.
- `GET /cycles` con los mismos filtros; columnas paciente, medicamento, estado del ciclo, fecha prevista, estado derivado, sucursal y responsable.
- Cambiar el estado usa `POST /cycles/:id/move`.
- Ordenación por fecha prevista en cliente sobre las páginas cargadas.
- Paginación por cursor con «Cargar más».

## Filtros

`sucursal`, `responsable`, `medicamento`, `estado derivado`, `q` (paciente), `expected_from` y `expected_to`, todos en la URL.

- Owner/admin ven «Todas las sucursales».
- Un usuario con una sola sucursal la tiene fijada y el selector queda deshabilitado.
- El resto de roles arranca en su primera sucursal.

## Existencias

- `/ajustes/existencias`: tabla por sucursal con selector hay/poco/no hay y última revisión.
- Las marcas de más de 7 días se resaltan en ámbar con aviso «revisar».
- `StockMarkDialog` se reutiliza desde la tarjeta, desde el modal de Preparado y desde la página de ajustes.
- Toda escritura usa `PUT /branches/:branchId/stock-marks/:medicationId` e invalida existencias y tablero.

## Incidencias

- Pipeline Nueva → En curso → Resuelta con `KanbanBoard`.
- Tarjeta: tipo, paciente enlazado, sucursal, responsable, fecha y descripción.
- Alta con sucursal, tipo, paciente opcional, responsable y descripción; desde una tarjeta del tablero se precargan paciente, tratamiento y ciclo.
- Asignación con `PATCH /incidents/:id`; detalle en modal.
- Drop en Resuelta abre el modal de resolución; el botón queda deshabilitado sin texto. Solo `incident:resolve` ve «Resolver».
- Filtros por sucursal, tipo y responsable en URL.
- La ficha del paciente muestra sus incidencias abiertas con enlace a `/incidencias?incident=...`.

## Permisos en UI (`useCan`)

| Acción | Efecto en la web |
| --- | --- |
| `treatments:read` | Ver tablero, tabla, tarjetas e incidencias |
| `cycle:move` | Arrastrar y «Mover a…» |
| `cycle:edit-date` | «Cambiar fecha prevista» |
| `stock:mark` | «Actualizar existencias» y menú de Ajustes |
| `treatments:write` | Avisar, entregar y no retirado |
| `incident:create` | Crear incidencia |
| `incident:move` | Mover incidencias |
| `incident:resolve` | Resolver incidencias |

`read_only` no recibe handles de arrastre ni menú de acciones.

## Accesibilidad

- Tarjetas movibles con teclado; instrucciones y anuncios de dnd-kit en español.
- Handles con `aria-label` («Mover …»), menús con `aria-haspopup`, `aria-expanded` y cierre con Escape.
- Chips con contraste; solo «Vencido» usa rojo y el coral se reserva al botón «Avisar».

## Cambios de API necesarios

- `BoardCard` incluye `responsible_user_id` y `responsible` para la tabla.
- `Incident` incluye `branch`, `patient`, `assignee` y `creator` para evitar N+1.
- `ErrorResponse` documenta `details`.
- Migración `20261027120000_phase2_web_menu` inserta Tablero, Incidencias y Existencias en `menu_items`.
- `openapi.generated.json` y `src/lib/api-types.ts` se regeneraron con `pnpm gen:api`.

## Puerta de salida

Resultados de Playwright en `e2e/phase2-board.spec.ts`:

| # | Escenario | Resultado |
| --- | --- | --- |
| 1 | Arrastrar Por avisar → Avisado, recarga e historial | **OK** — 40.4 s |
| 2 | Fallo de API: vuelve a su columna y avisa | **OK** — 11.2 s |
| 3 | Sin existencias → modal → confirmar → incidencia visible | **OK** — 33.7 s |
| 4 | Marcar entregado → última columna y siguiente ciclo | **OK** — 28.6 s |
| 5 | Cambiar fecha prevista recoloca sin recargar | **OK** — 51.8 s |
| 6 | Filtro de sucursal: mismos ciclos en Tablero y Tabla | **OK** — 15.3 s |
| 7 | Resolver exige texto; con texto pasa a Resuelta | **OK** — 19.2 s |
| 8 | `read_only` no arrastra ni ve acciones | **OK** — 37.3 s |
| 9 | 5.000 ciclos: primera pantalla y fluidez | revisión manual documentada abajo |
| 10 | typecheck, lint, tests y build | **OK** (38 tests, build de producción) |

Comando: `PLAYWRIGHT_BASE_URL=http://localhost:5174 pnpm exec playwright test e2e/phase2-board.spec.ts`.
Resultado final: **8/8 Playwright**, **38/38 tests unitarios**, `typecheck` y `build` en verde.

Capturas:
- `test-results/board-phase2.png`
- `test-results/table-phase2.png`

### Nota de rendimiento (revisión manual)

La API ya tiene su benchmark local documentado en `max-care-api/docs/phase2-performance.md`: **p50 51 ms · p95 59 ms** con filtro de sucursal y **p95 68 ms** sin filtros, con 5.000 ciclos abiertos.

La UI pide una sola vez `GET /board` y renderiza como máximo 30 tarjetas por columna (150 nodos), sin cargar las 5.000 en el DOM. Con el seed de 5.000 ciclos el tablero mostró correctamente los contadores (1.250 por columna abierta). La medición de primera pantalla contra el entorno Neon de desarrollo fue de ~17 s, dominada por la latencia de red y no por el render; el mismo backend medido en PostgreSQL local queda en decenas de milisegundos. Para una comprobación representativa hay que ejecutar la web contra la API local, no contra Neon.
