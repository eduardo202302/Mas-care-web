import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'

const suffix = randomUUID()
const email = `tratamientos-${suffix}@example.test`
const password = 'FarmaciaSegura123!'

test.setTimeout(120_000)

function localDate(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

test('crear tratamiento, pausar con motivo y ajustar cobertura', async ({
  page,
}) => {
  await page.goto('/registro')
  await page.getByLabel('Nombre completo').fill('Farmacéutica Tratamientos')
  await page
    .getByLabel('Nombre de usuario')
    .fill(`tratamientos${suffix.slice(0, 8)}`)
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Móvil').fill(`3${Date.now().toString().slice(-9)}`)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL(/\/inicio$/)

  const medication = `Medicamento E2E ${suffix}`
  await page.goto('/medicamentos')
  await page.getByRole('button', { name: 'Nuevo medicamento' }).click()
  await page.getByLabel('Nombre comercial').fill(medication)
  await page.getByLabel('Presentación').fill('Caja con tabletas')
  await page.getByLabel('Unidad de dosis').fill('tableta')
  await page.getByLabel('Unidades por envase').fill('30')
  await page.getByRole('button', { name: 'Crear medicamento' }).click()
  await expect(
    page.getByRole('table').getByText(medication, { exact: true }),
  ).toBeVisible()

  const branch = `Sucursal Tratamientos ${suffix}`
  await page.goto('/ajustes/sucursales')
  await page.getByRole('button', { name: 'Nueva sucursal' }).click()
  await page.getByLabel('Nombre de sucursal').fill(branch)
  await page.getByRole('button', { name: 'Crear sucursal' }).click()
  await expect(
    page.getByRole('table').getByText(branch, { exact: true }),
  ).toBeVisible()

  const patient = `Paciente Tratamiento ${suffix}`
  await page.goto('/pacientes')
  await page.getByRole('button', { name: 'Nuevo paciente' }).click()
  await page.getByLabel('Nombre completo').fill(patient)
  await page.getByLabel('Sucursal', { exact: true }).selectOption({
    label: branch,
  })
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await page.getByRole('link', { name: patient }).click()

  await page.getByRole('button', { name: 'Tratamientos' }).click()
  await page.getByRole('button', { name: 'Nuevo tratamiento' }).click()

  const dialog = page.getByRole('dialog', { name: 'Nuevo tratamiento' })
  await dialog
    .getByRole('combobox', { name: /Medicamento/ })
    .fill(medication)
  await dialog.getByRole('option', { name: new RegExp(medication) }).click()
  await dialog.getByLabel('Dosis por toma').fill('1')
  await dialog.getByLabel('Tomas por día').fill('1')
  await dialog.getByLabel('Cantidad por ciclo').fill('30')
  await dialog.getByLabel('Fecha de inicio').fill(localDate(0))
  await dialog.getByLabel('Prescriptor').fill('Dra. E2E')
  await dialog.getByLabel('Vencimiento de receta').fill(localDate(60))
  await expect(
    dialog.getByText(/Cubre 30 días, hasta \d{2}\/\d{2}\/\d{4}/),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Crear tratamiento' }).click()
  await expect(dialog).toBeHidden()

  const item = page.getByRole('listitem', {
    name: `Tratamiento de ${medication}`,
  })
  await expect(item).toBeVisible()
  await expect(item.getByText('Al día', { exact: true })).toBeVisible()

  await item.getByRole('button', { name: 'Pausar' }).click()
  const pauseDialog = page.getByRole('dialog', { name: 'Pausar tratamiento' })
  await pauseDialog
    .getByRole('button', { name: 'Pausar tratamiento' })
    .click()
  await expect(
    pauseDialog.getByText('El motivo es obligatorio.'),
  ).toBeVisible()
  await pauseDialog
    .getByLabel(/Motivo/)
    .fill('Paciente en espera de valoración médica')
  await pauseDialog
    .getByRole('button', { name: 'Pausar tratamiento' })
    .click()
  await expect(pauseDialog).toBeHidden()
  await expect(item.getByText('Pausado', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(
    page.getByText('Paciente en espera de valoración médica', {
      exact: true,
    }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Tratamientos' }).click()
  await item.getByRole('button', { name: 'Reanudar' }).click()
  await expect(item.getByText('Al día', { exact: true })).toBeVisible()

  await item.getByRole('button', { name: 'Ajustar cobertura' }).click()
  const adjustDialog = page.getByRole('dialog', {
    name: 'Ajustar fin de cobertura',
  })
  await adjustDialog.getByLabel('Nuevo fin de cobertura').fill(localDate(45))
  await adjustDialog
    .getByLabel(/Motivo/)
    .fill('Entrega extraordinaria de cobertura')
  await adjustDialog
    .getByRole('button', { name: 'Ajustar cobertura' })
    .click()
  await expect(adjustDialog).toBeHidden()

  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(
    page.getByText('Entrega extraordinaria de cobertura', { exact: true }),
  ).toBeVisible()
})
