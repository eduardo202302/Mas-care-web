# Max Care Web · Fase 0

SPA de gestión para farmacias. Incluye acceso, organización, sucursales, componentes de estado y layout base.

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
- `pnpm gen:api` genera `src/lib/api-types.ts` directamente desde `/api/v1/openapi.json`.

## Fase 2: tablero, existencias e incidencias

- `/tablero`: Kanban con arrastre (ratón, táctil y teclado), movimiento optimista con TanStack Query, conflicto `409`, modal `422 STOCK_OUT_OF_STOCK`, warnings `STOCK_LOW`/`STOCK_STALE`, paginación por cursor y vista Tabla sincronizada.
- `/incidencias`: pipeline Nueva → En curso → Resuelta reutilizando el tablero genérico; resolución obligatoria al soltar en Resuelta.
- `/ajustes/existencias`: marca manual por sucursal con resaltado de revisiones de más de 7 días.
- Filtros en la URL; Zustand solo recuerda la última vista Tablero/Tabla.

Detalle, árbol de componentes y resultados de la puerta de salida en [`docs/phase2-web.md`](docs/phase2-web.md).

## Docker

```powershell
docker build --build-arg VITE_API_URL=http://localhost:3000 -t max-care-web .
docker run --rm -p 8080:80 max-care-web
```

`VITE_API_URL` queda incorporada en el bundle durante el build, como corresponde a una variable Vite pública. El contenedor Nginx aplica fallback a `index.html` para rutas de React Router.
