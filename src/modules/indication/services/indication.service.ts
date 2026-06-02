import { httpRequest } from '@/core/http/request.helper'
import type { FetchResponse, ListingFilter } from '@/shared/hooks/useListing'
import type {
  ApiIndicationDetail,
  IndicationApiResponse,
  IndicationRow,
} from '../types/indication.type'
import type {
  CreateIndicationSchemaValues,
  UpdateIndicationSchemaValues,
} from '../schemas/indication.schema'

interface ApiIndication {
  id: number
  ip: string
  name: string
  city_id: number
  organization_id: number
  grant_date: string
  created_at: string
  updated_at: string
}

interface ApiPagination {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

interface ApiIndicationListResponse {
  data: ApiIndication[]
  pagination: ApiPagination
}

interface ApiOptionItem {
  id: number
  name: string
}

interface ApiOptionsResponse {
  data: ApiOptionItem[]
  pagination: ApiPagination
}

interface ApiWritePayload {
  name: string
  ip: string
  city_id: number
  organization_id: number
  grant_date: string
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('pt-BR')
}

function toWritePayload(values: CreateIndicationSchemaValues): ApiWritePayload {
  return {
    name: values.name,
    ip: values.ip,
    city_id: Number(values.city_id),
    organization_id: Number(values.organization_id),
    grant_date: values.grant_date,
  }
}

export async function fetchIndications(
  filter: ListingFilter
): Promise<FetchResponse<IndicationRow>> {
  const { search, page, limit, signal, extraParams } = filter

  const response = await httpRequest<ApiIndicationListResponse>(
    'GET',
    '/geographical-indications',
    undefined,
    {
      params: {
        page,
        per_page: limit,
        search,
        ...extraParams,
      },
      signal,
    }
  )

  const rows: IndicationRow[] = response.data.map((item) => ({
    id: item.id,
    ip: item.ip,
    name: item.name,
    cityId: item.city_id,
    organizationId: item.organization_id,
    concessionDate: item.grant_date,
    createdAt: formatDate(item.created_at),
  }))

  return {
    data: rows,
    meta: {
      currentPage: response.pagination.current_page,
      totalPages: response.pagination.last_page,
      totalItems: response.pagination.total,
      itemsPerPage: response.pagination.per_page,
    },
  }
}

export async function fetchIndicationById(
  id: number,
  signal?: AbortSignal
): Promise<ApiIndicationDetail> {
  const response = await httpRequest<{ data: ApiIndicationDetail }>(
    'GET',
    `/geographical-indications/${id}`,
    undefined,
    { signal }
  )
  return response.data
}

export function mapToDisplayData(raw: ApiIndicationDetail): IndicationApiResponse {
  return {
    id: raw.id,
    ip: raw.ip ?? undefined,
    internal_uuid: String(raw.id),
    indication_name: raw.name,
    image_url: '',
    registration_code: raw.ip ?? '',
    organization_name: raw.organization.name,
    location: {
      city: raw.city.name,
      state: raw.city.state.uf,
      country: 'Brasil',
      zip_code: '',
      coordinates: { lat: 0, lng: 0 },
    },
    created_at: raw.created_at,
    concession_date: raw.grant_date,
    is_active: true,
    audit_logs: [],
  }
}

export async function deleteIndication(id: number): Promise<void> {
  await httpRequest('DELETE', '/geographical-indications/' + id)
}

export async function createIndication(values: CreateIndicationSchemaValues): Promise<void> {
  await httpRequest('POST', '/geographical-indications', toWritePayload(values))
}

export async function updateIndication(
  id: number,
  values: UpdateIndicationSchemaValues
): Promise<void> {
  await httpRequest('PUT', `/geographical-indications/${id}`, toWritePayload(values))
}

export async function fetchCityOptions(signal?: AbortSignal): Promise<ApiOptionItem[]> {
  const response = await httpRequest<ApiOptionsResponse>('GET', '/cities', undefined, {
    params: { per_page: 100 },
    signal,
  })
  return response.data
}

export async function fetchOrganizationOptions(signal?: AbortSignal): Promise<ApiOptionItem[]> {
  const response = await httpRequest<ApiOptionsResponse>('GET', '/organizations', undefined, {
    params: { per_page: 100 },
    signal,
  })
  return response.data
}
