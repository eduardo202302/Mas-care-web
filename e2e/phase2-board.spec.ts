import { expect, test, type Browser, type Page } from '@playwright/test'
import { randomUUID } from 'node:crypto'

const API = 'http://localhost:3000'
const suffix = randomUUID().replace(/-/g, '').slice(0, 10)
const password = 'TableroTest2026!'
const email = `tablero-${suffix}@example.test`
const username = `tablero_${suffix}`

let page: Page
let branch: { id: string; name: string }
let medication: { id: string; name: string }
let patient: { id: string; fullName: string; phone: string }
let treatment: { id: string; quantityPerCycle: string | number }
let cardId = ''
let readOnlyEmail = ''
let readOnlyPassword = ''

function localDate(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

async function json<T>(response: Awaited<ReturnType<Page['request']['get']>>) {
  return (await response.json()) as T
}

async function getMe() {
  const response = await page.request.get(`${API}/api/v1/me`)
  expect(response.ok()).toBe(true)
  return json<{
    user: { id: string; name: string }
    organization: { id: string }
    branches: { id: string; name: string }[]
  }>(response)
}

async function createPatient(name: string, phone: string) {
  const me = await getMe()
  const response = await page.request.post(`${API}/api/v1/patients`, {
    data: {
      primaryBranchId: branch.id,
      fullName: name,
      documentId: `E2E-${suffix}-${phone.slice(-5)}`,
      phone,
      responsibleUserId: me.user.id,
    },
  })
  expect(response.status()).toBe(201)
  return json<{ patient: { id: string; fullName: string } }>(response)
}

async function createTreatment(patientId: string) {
  const me = await getMe()
  const response = await page.request.post(`${API}/api/v1/treatments`, {
    data: {
      patient_id: patientId,
      medication_id: medication.id,
      branch_id: branch.id,
      responsible_user_id: me.user.id,
      dose_per_intake: 1,
      intakes_per_day: 1,
      quantity_per_cycle: 30,
      start_date: localDate(0),
      prescriber_name: 'Dra. E2E',
      prescription_expires_on: localDate(60),
      notes: 'Datos ficticios de prueba',
    },
  })
  expect(response.status()).toBe(201)
  return json<{ id: string; quantityPerCycle: string | number }>(response)
}

async function boardCardId(patientId: string) {
  const response = await page.request.get(
    `${API}/api/v1/board?branch_id=${branch.id}`,
  )
  expect(response.ok()).toBe(true)
  const board = await json<{
    columns: Record<
      string,
      { cards: { cycle_id: string; patient: { id: string } }[] }
    >
  }>(response)
  for (const column of Object.values(board.columns)) {
    const card = column.cards.find((item) => item.patient.id === patientId)
    if (card) return card.cycle_id
  }
  throw new Error(`No board card for patient ${patientId}`)
}

async function dragCardToColumn(
  card: string,
  columnKey: string,
  steps = 1,
  prefix = 'board',
) {
  const target = page.getByTestId(`${prefix}-column-${columnKey}`)
  await expect(target).toBeVisible()
  const handle = page
    .getByTestId(`${prefix}-card-${card}`)
    .getByRole('button', { name: /^Mover / })
  await handle.scrollIntoViewIfNeeded()
  await target.scrollIntoViewIfNeeded()
  const sourceBox = await handle.boundingBox()
  const targetBox = await target.boundingBox()
  if (!sourceBox || !targetBox) throw new Error('No boxes for drag')
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  )
  await page.mouse.down()
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + 24,
    { steps: 3 },
  )
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + 140,
    { steps: 6 + steps * 3 },
  )
  await page.waitForTimeout(300)
  await page.mouse.up()
}

async function cardOrderInColumn(columnKey: string) {
  return page
    .getByTestId(`board-column-${columnKey}`)
    .locator('[data-testid^="board-card-"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-testid')!.replace('board-card-', '')),
    )
}

test.setTimeout(180_000)
test.use({ viewport: { width: 1680, height: 1000 } })

test.describe.serial('Fase 2 · tablero, existencias e incidencias', () => {
  test.beforeAll(async ({ browser }: { browser: Browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
    page.on('pageerror', (error) => console.error('PAGE ERROR', error))

    await page.goto('/registro')
    await page.getByLabel('Nombre completo').fill('Owner Tablero E2E')
    await page.getByLabel('Nombre de usuario').fill(username)
    await page.getByLabel('Correo electrónico').fill(email)
    await page.getByLabel('Móvil').fill(`3${Date.now().toString().slice(-9)}`)
    await page.getByLabel('Contraseña', { exact: true }).fill(password)
    const activated = page
      .waitForResponse(
        (response) => response.url().includes('/api/auth/organization/set-active'),
        { timeout: 60_000 },
      )
      .catch(() => null)
    await page.getByRole('button', { name: 'Crear cuenta' }).click()
    await expect(page).toHaveURL(/\/inicio$/, { timeout: 90_000 })
    await activated
    await expect(
      page.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeVisible({ timeout: 60_000 })
    await expect
      .poll(async () => (await page.request.get(`${API}/api/v1/me`)).status())
      .toBe(200)

    const branchResponse = await page.request.post(`${API}/api/v1/branches`, {
      data: { name: `Sucursal Tablero ${suffix}` },
    })
    expect(branchResponse.status()).toBe(201)
    branch = await json(branchResponse)

    const medicationResponse = await page.request.post(`${API}/api/v1/medications`, {
      data: {
        genericName: `Medicamento Tablero ${suffix}`,
        presentation: '30 tabletas',
        doseUnit: 'tableta',
        unitsPerPackage: 30,
      },
    })
    expect(medicationResponse.status()).toBe(201)
    medication = await json(medicationResponse)

    const patientName = `Paciente Tablero ${suffix}`
    const phone = `3${Date.now().toString().slice(-9)}`
    const patientResponse = await createPatient(patientName, phone)
    patient = {
      id: patientResponse.patient.id,
      fullName: patientResponse.patient.fullName,
      phone,
    }
    treatment = await createTreatment(patient.id)
    cardId = await boardCardId(patient.id)
  })

  test.afterAll(async () => {
    await page?.context().close()
  })

  test('1. arrastrar Por avisar → Avisado persiste y queda en historial', async () => {
    await page.goto(`/tablero?branch_id=${branch.id}`)
    await expect(page.getByRole('heading', { name: 'Tablero de reposiciones' })).toBeVisible()
    await expect(page.getByTestId(`board-card-${cardId}`)).toBeVisible()

    const moveResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/cycles/${cardId}/move`) &&
        response.request().method() === 'POST',
    )
    await dragCardToColumn(cardId, 'notified')
    expect((await moveResponse).status()).toBe(200)
    await expect(
      page.getByTestId('board-column-notified').getByTestId(`board-card-${cardId}`),
    ).toBeVisible()

    await page.reload()
    await expect(
      page.getByTestId('board-column-notified').getByTestId(`board-card-${cardId}`),
    ).toBeVisible()

    await page.goto(`/pacientes/${patient.id}`)
    await expect(page.getByText('Ciclo movido')).toBeVisible()
    const activities = await page.request.get(
      `${API}/api/v1/patients/${patient.id}/activities?limit=25`,
    )
    const body = (await activities.json()) as {
      data: { type: string; treatmentId: string | null; metadata: Record<string, unknown> }[]
    }
    const moved = body.data.find((activity) => activity.type === 'cycle_moved')
    expect(moved?.treatmentId).toBe(treatment.id)
    expect(moved?.metadata).toMatchObject({ from: 'to_notify', to: 'notified' })
  })

  test('2. un fallo de API devuelve la tarjeta y muestra aviso', async () => {
    await page.goto(`/tablero?branch_id=${branch.id}`)
    await page.route(`**/api/v1/cycles/${cardId}/move`, (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'INTERNAL_ERROR', message: 'Fallo forzado del tablero' },
        }),
      }),
    )
    await dragCardToColumn(cardId, 'confirmed')
    await expect(page.getByText('Fallo forzado del tablero')).toBeVisible()
    await expect(
      page.getByTestId('board-column-notified').getByTestId(`board-card-${cardId}`),
    ).toBeVisible()
    await page.unroute(`**/api/v1/cycles/${cardId}/move`)
  })

  test('3. Preparado sin existencias pide confirmación y crea incidencia', async () => {
    await page.request.put(
      `${API}/api/v1/branches/${branch.id}/stock-marks/${medication.id}`,
      { data: { level: 'out_of_stock' } },
    )
    await page.goto(`/tablero?branch_id=${branch.id}`)

    const stockOut = page.waitForResponse(
      (response) =>
        response.url().includes(`/cycles/${cardId}/move`) &&
        response.request().method() === 'POST' &&
        response.status() === 422,
    )
    await dragCardToColumn(cardId, 'prepared', 2)
    await stockOut
    await expect(page.getByRole('dialog', { name: 'No hay existencias' })).toBeVisible()
    const confirm = page.waitForResponse(
      (response) =>
        response.url().includes(`/cycles/${cardId}/move`) &&
        response.request().method() === 'POST' &&
        response.status() === 200,
    )
    await page.getByRole('button', { name: 'Mover igualmente (crea incidencia)' }).click()
    await confirm
    await expect(
      page.getByTestId('board-column-prepared').getByTestId(`board-card-${cardId}`),
    ).toBeVisible()

    await page.goto(`/incidencias?branch_id=${branch.id}`)
    const incidentCard = page
      .locator('[data-testid^="incidents-card-"]')
      .filter({ hasText: patient.fullName })
    await expect(incidentCard).toBeVisible()
    await expect(
      incidentCard.getByText('Sin existencias', { exact: true }),
    ).toBeVisible()
  })

  test('4. Marcar entregado mueve a la última columna y crea el siguiente ciclo', async () => {
    await page.goto(`/tablero?branch_id=${branch.id}`)
    const card = page.getByTestId(`board-card-${cardId}`)
    await card.getByRole('button', { name: /Acciones de/ }).click()
    await page.getByRole('menuitem', { name: 'Marcar entregado' }).click()
    const dialog = page.getByRole('dialog', { name: 'Registrar entrega' })
    await expect(dialog).toBeVisible()
    const quantity = dialog.getByLabel('Cantidad entregada')
    if (!(await quantity.inputValue())) {
      await quantity.fill('30')
    }
    const deliver = page.waitForResponse(
      (response) =>
        response.url().includes(`/treatments/${treatment.id}/deliver`) &&
        response.request().method() === 'POST',
    )
    await dialog.getByRole('button', { name: 'Confirmar entrega' }).click()
    expect((await deliver).status()).toBe(201)

    await expect(
      page.getByTestId('board-column-closed').getByText(patient.fullName).first(),
    ).toBeVisible()
    await expect(
      page.getByTestId('board-column-to_notify').getByText(patient.fullName).first(),
    ).toBeVisible()
  })

  test('5. cambiar la fecha prevista recoloca sin recargar', async () => {
    const second = await createPatient(`Paciente Fecha ${suffix}`, `3${Date.now().toString().slice(-9)}`)
    const secondTreatment = await createTreatment(second.patient.id)
    const secondCard = await boardCardId(second.patient.id)

    await page.goto(`/tablero?branch_id=${branch.id}`)
    await expect(page.getByTestId(`board-card-${secondCard}`)).toBeVisible({
      timeout: 60_000,
    })
    let order = await cardOrderInColumn('to_notify')
    expect(order.indexOf(secondCard)).toBeGreaterThanOrEqual(0)

    const target = page.getByTestId(`board-card-${secondCard}`)
    await target.getByRole('button', { name: /Acciones de/ }).click()
    await page.getByRole('menuitem', { name: 'Cambiar fecha prevista' }).click()
    const dialog = page.getByRole('dialog', { name: 'Cambiar fecha prevista' })
    await dialog.getByLabel('Nueva fecha de reposición').fill(localDate(-1))
    const save = page.waitForResponse(
      (response) =>
        response.url().includes(`/cycles/${secondCard}/expected-on`) &&
        response.request().method() === 'PATCH',
    )
    await dialog.getByRole('button', { name: 'Guardar fecha' }).click()
    expect((await save).status()).toBe(200)
    await expect(page.getByText('Fecha prevista actualizada.')).toBeVisible()

    const [year, month, day] = localDate(-1).split('-')
    await expect(page.getByTestId(`board-card-${secondCard}`)).toBeVisible()
    await expect(
      page.getByTestId(`board-card-${secondCard}`).getByText(`${day}/${month}/${year}`),
    ).toBeVisible()
    order = await cardOrderInColumn('to_notify')
    expect(order[0]).toBe(secondCard)
    expect(secondTreatment.id).toBeTruthy()
  })

  test('6. filtro de sucursal da los mismos ciclos en Tablero y Tabla', async () => {
    await page.goto(`/tablero?branch_id=${branch.id}&view=tablero`)
    await expect(page.getByRole('heading', { name: 'Tablero de reposiciones' })).toBeVisible()
    await expect(page.getByTestId(`board-card-${cardId}`)).toBeVisible({
      timeout: 60_000,
    })
    const boardIds = await page
      .locator('[data-testid^="board-card-"]')
      .evaluateAll((nodes) =>
        nodes
          .map((node) => node.getAttribute('data-testid')!.replace('board-card-', ''))
          .sort(),
      )
    await page.screenshot({ path: 'test-results/board-phase2.png', fullPage: true })

    await page.getByRole('tab', { name: 'Tabla' }).click()
    await expect(page.getByRole('tab', { name: 'Tabla' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByTestId(`table-row-${cardId}`)).toBeVisible({
      timeout: 60_000,
    })
    const tableIds = await page
      .locator('[data-testid^="table-row-"]')
      .evaluateAll((nodes) =>
        nodes
          .map((node) => node.getAttribute('data-testid')!.replace('table-row-', ''))
          .sort(),
      )
    await page.screenshot({ path: 'test-results/table-phase2.png', fullPage: true })
    expect(tableIds).toEqual(boardIds)
  })

  test('7. resolver incidencia exige texto y la mueve a Resuelta', async () => {
    const incidentResponse = await page.request.post(`${API}/api/v1/incidents`, {
      data: {
        branch_id: branch.id,
        type: 'patient_reported',
        patient_id: patient.id,
        description: `Incidencia E2E ${suffix}`,
      },
    })
    expect(incidentResponse.status()).toBe(201)
    const incident = (await incidentResponse.json()) as { id: string }

    await page.goto(`/incidencias?branch_id=${branch.id}`)
    const card = page.getByTestId(`incidents-card-${incident.id}`)
    await expect(card).toBeVisible()
    const resolveResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/incidents/${incident.id}/resolve`) &&
        response.request().method() === 'POST',
    )
    await dragCardToColumn(incident.id, 'resolved', 2, 'incidents')

    const dialog = page.getByRole('dialog', { name: 'Resolver incidencia' })
    await expect(dialog).toBeVisible()
    const submit = dialog.getByRole('button', { name: 'Resolver incidencia' })
    await expect(submit).toBeDisabled()
    await dialog.getByRole('textbox').fill('Se contactó al paciente y se resolvió.')
    await submit.click()
    expect((await resolveResponse).status()).toBe(200)
    await expect(
      page.getByTestId('incidents-column-resolved').getByTestId(`incidents-card-${incident.id}`),
    ).toBeVisible()
  })

  test('8. read_only ve el tablero pero no puede arrastrar ni editar', async ({ browser }) => {
    readOnlyEmail = `lectura-${suffix}@example.test`
    readOnlyPassword = 'LecturaTest2026!'
    const user = await page.request.post(`${API}/api/v1/users`, {
      data: {
        name: 'Lectura Tablero',
        username: `lectura_${suffix}`,
        email: readOnlyEmail,
        password: readOnlyPassword,
        role: 'read_only',
        branchIds: [branch.id],
      },
    })
    expect(user.status()).toBe(201)

    const context = await browser.newContext()
    const readOnlyPage = await context.newPage()
    await readOnlyPage.goto('/acceso')
    await readOnlyPage.getByLabel('Correo electrónico').fill(readOnlyEmail)
    await readOnlyPage.getByLabel('Contraseña', { exact: true }).fill(readOnlyPassword)
    const activated = readOnlyPage
      .waitForResponse(
        (response) => response.url().includes('/api/auth/organization/set-active'),
        { timeout: 60_000 },
      )
      .catch(() => null)
    await readOnlyPage.getByRole('button', { name: 'Ingresar' }).click()
    await expect(readOnlyPage).toHaveURL(/\/inicio$/, { timeout: 90_000 })
    await activated
    await expect(
      readOnlyPage.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeVisible({ timeout: 60_000 })
    await expect
      .poll(async () => (await readOnlyPage.request.get(`${API}/api/v1/me`)).status())
      .toBe(200)
    await readOnlyPage.goto(`/tablero?branch_id=${branch.id}`)
    await expect(readOnlyPage.getByTestId(`board-card-${cardId}`)).toBeVisible()
    await expect(readOnlyPage.getByRole('button', { name: /^Mover / })).toHaveCount(0)
    await expect(readOnlyPage.getByRole('button', { name: /Acciones de/ })).toHaveCount(0)
    await expect(readOnlyPage.getByRole('button', { name: 'Nueva incidencia' })).toHaveCount(0)
    await context.close()
  })
})


