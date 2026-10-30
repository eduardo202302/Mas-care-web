import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'

const suffix = randomUUID()
const email = `operacion-${suffix}@example.test`
const password = 'FarmaciaSegura123!'

test.setTimeout(180_000)

function localDate(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

test('panel del día, aviso, entrega idempotente, tareas y plantillas', async ({
  page,
}) => {
  await page.goto('/registro')
  await page.getByLabel('Nombre completo').fill('Farmacéutica Operación')
  await page
    .getByLabel('Nombre de usuario')
    .fill(`operacion${suffix.slice(0, 8)}`)
  await page.getByLabel('Correo electrónico').fill(email)
  await page.getByLabel('Móvil').fill(`3${Date.now().toString().slice(-9)}`)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL(/\/inicio$/)

  const branch = `Sucursal Operación ${suffix}`
  await page.goto('/ajustes/sucursales')
  await page.getByRole('button', { name: 'Nueva sucursal' }).click()
  await page.getByLabel('Nombre de sucursal').fill(branch)
  await page.getByRole('button', { name: 'Crear sucursal' }).click()
  await expect(page.getByRole('table').getByText(branch)).toBeVisible()

  const medication = `Medicamento Operación ${suffix}`
  await page.goto('/medicamentos')
  await page.getByRole('button', { name: 'Nuevo medicamento' }).click()
  await page.getByLabel('Nombre comercial').fill(medication)
  await page.getByLabel('Presentación').fill('Caja con tabletas')
  await page.getByLabel('Unidad de dosis').fill('tableta')
  await page.getByLabel('Unidades por envase').fill('30')
  await page.getByRole('button', { name: 'Crear medicamento' }).click()
  await expect(page.getByRole('table').getByText(medication)).toBeVisible()

  const patient = `Paciente Operación ${suffix}`
  const phone = `3${Date.now().toString().slice(-9)}`
  await page.goto('/pacientes')
  await page.getByRole('button', { name: 'Nuevo paciente' }).click()
  await page.getByLabel('Nombre completo').fill(patient)
  await page.getByLabel('Sucursal', { exact: true }).selectOption({
    label: branch,
  })
  await page.getByLabel('Teléfono').fill(phone)
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await page.getByRole('link', { name: patient }).click()

  await page.getByRole('button', { name: 'Tratamientos' }).click()
  await page.getByRole('button', { name: 'Nuevo tratamiento' }).click()
  const treatmentDialog = page.getByRole('dialog', {
    name: 'Nuevo tratamiento',
  })
  await treatmentDialog
    .getByRole('combobox', { name: /Medicamento/ })
    .fill(medication)
  await treatmentDialog
    .getByRole('option', { name: new RegExp(medication) })
    .click()
  await treatmentDialog.getByLabel('Dosis por toma').fill('1')
  await treatmentDialog.getByLabel('Tomas por día').fill('1')
  await treatmentDialog.getByLabel('Cantidad por ciclo').fill('1')
  await treatmentDialog.getByLabel('Fecha de inicio').fill(localDate(-1))
  await treatmentDialog
    .getByRole('button', { name: 'Crear tratamiento' })
    .click()
  await expect(treatmentDialog).toBeHidden()

  const taskTitle = `Confirmar retiro ${suffix}`
  await page.goto('/tareas')
  await page.getByRole('button', { name: 'Nueva tarea' }).first().click()
  const taskDialog = page.getByRole('dialog', { name: 'Nueva tarea' })
  await taskDialog.getByLabel('Título').fill(taskTitle)
  await taskDialog.getByLabel(/Paciente/).selectOption({ label: patient })
  await taskDialog.getByRole('button', { name: 'Crear tarea' }).click()
  await expect(taskDialog).toBeHidden()
  await page.getByRole('button', { name: 'Todas' }).click()
  const taskCard = page.locator('article').filter({ hasText: taskTitle })
  await expect(taskCard).toBeVisible()
  await taskCard.getByRole('button', { name: 'Completar' }).click()
  await expect(page.getByText(`Tarea completada: ${taskTitle}`)).toBeVisible()

  await page.goto('/inicio')
  await expect(
    page.getByRole('heading', { name: 'Panel del día' }),
  ).toBeVisible()
  await expect(
    page.locator('section').getByText(patient, { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Avisar' }).first().click()
  const noticeDialog = page.getByRole('dialog', { name: 'Avisar al paciente' })
  await expect(noticeDialog.getByText('Mensaje sugerido')).toBeVisible()
  await noticeDialog
    .getByRole('button', { name: 'Registrar sin abrir' })
    .click()
  await expect(
    noticeDialog.getByText('Aviso registrado en el historial del paciente.'),
  ).toBeVisible()
  await noticeDialog.getByRole('button', { name: 'Cerrar' }).click()
  await expect(noticeDialog).toBeHidden()

  const deliveryRequests: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/deliver')) {
      deliveryRequests.push(request.url())
    }
  })
  await page.getByRole('button', { name: 'Entregar' }).first().click()
  const deliveryDialog = page.getByRole('dialog', {
    name: 'Registrar entrega',
  })
  const confirmDelivery = deliveryDialog.getByRole('button', {
    name: 'Confirmar entrega',
  })
  await confirmDelivery.dblclick({ delay: 10 })
  await expect(deliveryDialog).toBeHidden()
  await expect(
    page.getByText(`Entrega registrada para ${patient}.`),
  ).toBeVisible()
  await page.waitForTimeout(500)
  expect(deliveryRequests).toHaveLength(1)

  await page.goto('/pacientes')
  await page.getByRole('link', { name: patient }).click()
  await page.getByRole('button', { name: 'Historial' }).click()
  await expect(
    page.getByText('Entrega registrada', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('1 unidad ·')).toBeVisible()

  const templateName = `Aviso Operación ${suffix}`
  await page.goto('/ajustes/plantillas')
  await page.getByRole('button', { name: 'Nueva plantilla' }).first().click()
  const templateDialog = page.getByRole('dialog', { name: 'Nueva Plantilla' })
  await templateDialog.getByLabel('Nombre de la Plantilla').fill(templateName)
  await templateDialog
    .getByLabel('Mensaje')
    .fill('Hola {{paciente}}, retira {{medicamento}} en {{farmacia}}.')
  await templateDialog
    .getByRole('button', { name: 'Guardar Plantilla' })
    .click()
  await expect(templateDialog).toBeHidden()
  await expect(page.getByText(templateName)).toBeVisible()
})
