/**
 * Mock data and fake fetch functions for the indication module.
 *
 * NOTE: No test runner (Jest/Vitest) is configured yet.
 * This file is reserved for future use when a test suite is added.
 * Do not add __mocks__ directories to new modules until a testing
 * strategy is defined. See docs/GOVERNANCE.md — "Testing" section.
 */
import type { IndicationApiResponse, IndicationRow } from '../../types/indication.type'
import type { FetchResponse, ListingFilter } from '@/shared/hooks/useListing'

export const baseMockApi: IndicationApiResponse = {
  id: 0,
  internal_uuid: '550e8400-e29b-41d4-a716-446655440000',
  indication_name: 'Calçado Infantil de Birigui',
  image_url: 'https://ui-avatars.com/api/?name=Birigui&background=4F46E5&color=fff&rounded=true',
  registration_code: 'IP - 1233544112233',
  organization_name: 'SINBI',
  location: {
    city: 'Birigui',
    state: 'SP',
    country: 'Brasil',
    zip_code: '16200-000',
    coordinates: { lat: -21.2886, lng: -50.3394 },
  },
  created_at: '2026-03-21T18:20:10Z',
  concession_date: '2026-03-21',
  is_active: true,
  audit_logs: ['Criado por admin', 'Aprovado por comitê'],
}

let allIndicationsMock: IndicationApiResponse[] = Array.from({ length: 35 }).map((_, index) => ({
  ...baseMockApi,
  id: index + 1,
  indication_name:
    index % 2 === 0
      ? `Calçado Infantil de Birigui ${index + 1}`
      : `Queijo da Canastra ${index + 1}`,
  registration_code: `IP - 12335441122${index + 10}`,
  organization_name: index % 2 === 0 ? 'SINBI' : 'APROCAN',
}))

export const fetchIndicationsApiMock = async (
  filter: ListingFilter
): Promise<FetchResponse<IndicationRow>> => {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const page: number = filter.page || 1
  const limit: number = filter.limit || 10
  const search: string = (filter.search ?? '').toLowerCase()

  const filtered = allIndicationsMock.filter(
    (item) =>
      item.indication_name.toLowerCase().includes(search) ||
      item.organization_name.toLowerCase().includes(search)
  )

  const paged = filtered.slice((page - 1) * limit, page * limit)

  const rows: IndicationRow[] = paged.map((item) => ({
    id: item.id,
    ip: item.ip ?? '',
    name: item.indication_name,
    cityId: 0,
    organizationId: 0,
    concessionDate: new Date(item.concession_date).toLocaleDateString('pt-BR'),
    createdAt: new Date(item.created_at).toLocaleString('pt-BR'),
  }))

  return {
    data: rows,
    meta: {
      currentPage: page,
      totalPages: Math.ceil(filtered.length / limit),
      totalItems: filtered.length,
      itemsPerPage: limit,
    },
  }
}

export const deleteIndicationMock = async (id: number, reloadFn: () => void): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  allIndicationsMock = allIndicationsMock.filter((item) => item.id !== id)
  reloadFn()
}
