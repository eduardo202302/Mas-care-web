import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'

const suffix = randomUUID()
const email = `maxcare-${suffix}@example.test`
const password = 'FarmaciaSegura123!'

test('registro, pacientes, vistas guardadas y logout', async ({ page }) => {
  await page.goto('/registro')
  await page.getByLabel('Nombre completo').fill('Farmacéutica Demo')
  await page.getByLabel('Nombre de usuario').fill(`farmacia${suffix.slice(0, 8)}`)
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Móvil').fill(`3${Date.now().toString().slice(-9)}`)
  await page.getByLabel('Contraseña').fill(password)
  await page
    .getByRole('button', { name: 'Crear cuenta' })
    .click()
  await expect(page).toHaveURL(/\/inicio$/)
  await page.goto('/ajustes/sucursales')
  const branchName = `Sucursal E2E ${suffix}`
  const updatedBranchName = `Sucursal E2E editada ${suffix}`
  await page.getByRole('button', { name: 'Nueva sucursal' }).click()
  await page.getByLabel('Nombre de sucursal').fill(branchName)
  await page.getByRole('button', { name: 'Crear sucursal' }).click()
  await expect(
    page.getByRole('table').getByText(branchName, { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: `Editar ${branchName}` }).click()
  await page.getByLabel('Nombre de sucursal').fill(updatedBranchName)
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(
    page.getByRole('table').getByText(updatedBranchName, { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: `Eliminar ${updatedBranchName}` })
    .click()
  await expect(page.getByText('Todavía no hay sucursales')).toBeVisible()
  const patientBranch = `Atención E2E ${suffix}`
  await page.getByRole('button', { name: 'Nueva sucursal' }).click()
  await page.getByLabel('Nombre de sucursal').fill(patientBranch)
  await page.getByRole('button', { name: 'Crear sucursal' }).click()
  await expect(
    page.getByRole('table').getByText(patientBranch, { exact: true }),
  ).toBeVisible()

  const phone = `7${Date.now().toString().slice(-7)}`
  const patientName = `Paciente E2E ${suffix}`
  const duplicateName = `Paciente duplicado ${suffix}`
  await page.goto('/pacientes')
  await page.getByRole('button', { name: 'Nuevo paciente' }).click()
  await page.getByLabel('Nombre completo').fill(patientName)
  await page.getByRole('textbox', { name: 'Teléfono' }).fill(phone)
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await expect(page.getByRole('link', { name: patientName })).toBeVisible()

  await page.getByRole('button', { name: 'Nuevo paciente' }).click()
  await page.getByLabel('Nombre completo').fill(duplicateName)
  await page.getByRole('textbox', { name: 'Teléfono' }).fill(phone)
  await expect(page.getByRole('status')).toContainText(patientName)
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await expect(page.getByRole('link', { name: duplicateName })).toBeVisible()

  const savedViewName = `Mis pacientes ${suffix}`
  await page.getByRole('button', { name: 'Guardar vista actual' }).click()
  await page.getByLabel('Nombre de la vista').fill(savedViewName)
  await page.getByRole('button', { name: 'Guardar vista', exact: true }).click()
  const savedViewSelect = page.getByLabel('Vistas')
  await expect(
    savedViewSelect.locator('option', { hasText: savedViewName }),
  ).toHaveCount(1)
  await savedViewSelect.selectOption({ label: savedViewName })
  await page.getByRole('button', { name: 'Borrar vista seleccionada' }).click()
  await expect(
    savedViewSelect.locator('option', { hasText: savedViewName }),
  ).toHaveCount(0)

  await page.getByRole('link', { name: patientName }).click()
  await page.getByRole('button', { name: 'Nota' }).click()
  const note = `Nota de seguimiento ${suffix}`
  await page.getByRole('textbox', { name: 'Nota' }).fill(note)
  await page.getByRole('button', { name: 'Añadir nota' }).click()
  await expect(page.getByText(note, { exact: true })).toBeVisible()

  await page.goto('/ajustes/usuarios')
  await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Farmacéutica Demo', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Ver ficha de Farmacéutica Demo' })
    .click()
  await expect(
    page.getByRole('dialog', { name: 'Ficha de usuario' }),
  ).toContainText('Propietario')

  await page.goto('/inicio')
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/acceso$/)
})

test('un 401 redirige a acceso', async ({ page }) => {
  await page.goto('/ajustes/sucursales')
  await expect(page).toHaveURL(/\/acceso$/)
})
