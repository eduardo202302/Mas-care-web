import { describe, expect, it } from 'vitest'
import {
  activityDetail,
  autoImportMapping,
  noticeChannelFor,
  resolveImportField,
} from './operations'

describe('operations', () => {
  it('reconoce encabezados CSV en español', () => {
    expect(resolveImportField('Nombre completo')).toBe('fullName')
    expect(resolveImportField('Cédula')).toBe('documentId')
    expect(resolveImportField('Fecha de nacimiento')).toBe('birthDate')
    expect(resolveImportField('Teléfono')).toBe('phone')
    expect(resolveImportField('Sucursal')).toBe('primaryBranchId')
  })

  it('arma el mapeo automático sin duplicar campos', () => {
    const mapping = autoImportMapping([
      'Nombre completo',
      'Documento',
      'Teléfono',
      'Correo',
    ])
    expect(mapping).toEqual({
      fullName: 'Nombre completo',
      documentId: 'Documento',
      phone: 'Teléfono',
      email: 'Correo',
    })
  })

  it('usa llamada para canales que no son WhatsApp', () => {
    expect(noticeChannelFor('whatsapp')).toBe('whatsapp')
    expect(noticeChannelFor('call')).toBe('call')
    expect(noticeChannelFor('sms')).toBe('call')
  })

  it('resume la entrega con cantidad en singular o plural', () => {
    const base = {
      id: 'activity-1',
      organizationId: 'org-1',
      type: 'delivery',
      patientId: 'patient-1',
      treatmentId: 'treatment-1',
      cycleId: 'cycle-1',
      body: '',
      authorId: 'user-1',
      occurredAt: '2026-10-26T12:00:00.000Z',
    }
    expect(
      activityDetail({
        ...base,
        metadata: {
          quantity: 1,
          delivered_on: '2026-10-26',
          picked_up_by: 'patient',
        },
      }),
    ).toBe('1 unidad · 26/10/2026 · Paciente')
    expect(
      activityDetail({
        ...base,
        metadata: { quantity: 3, picked_up_by: 'caregiver' },
      }),
    ).toBe('3 unidades · Cuidador')
  })
})
