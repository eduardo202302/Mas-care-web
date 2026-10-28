import 'dotenv/config'
import { execFileSync } from 'node:child_process'

const baseUrl = process.env.VITE_API_URL
if (!baseUrl) {
  console.error(
    'Falta VITE_API_URL. Copia .env.example a .env y configura la URL de max-care-api.',
  )
  process.exit(1)
}

execFileSync(
  process.execPath,
  [
    'node_modules/openapi-typescript/bin/cli.js',
    `${baseUrl.replace(/\/$/, '')}/api/v1/openapi.json`,
    '-o',
    'src/lib/api-types.ts',
  ],
  { stdio: 'inherit' },
)
