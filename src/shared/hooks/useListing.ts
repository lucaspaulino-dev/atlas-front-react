import { useState, useEffect, useRef, useCallback } from 'react'

export interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface FetchResponse<T> {
  data: T[]
  meta: PaginationState
}

export interface ListingFilter {
  search?: string
  page?: number
  limit?: number
  signal?: AbortSignal
  extraParams?: Record<string, string | string[]>
}

export interface UseListingOptions<T> {
  fetcher: (filter: ListingFilter) => Promise<FetchResponse<T>>
  initialPage?: number
  itemsPerPage?: number
  enablePagination?: boolean
}

export function useListing<T>(options: UseListingOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: options.initialPage || 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: options.itemsPerPage || 10,
  })
  const [extraParams, setExtraParams] = useState<Record<string, string | string[]> | undefined>(
    undefined
  )

  // Refs that are always current — read inside callbacks without stale closure issues
  const committedSearchRef = useRef('')
  const paginationRef = useRef(pagination)
  paginationRef.current = pagination

  const fetcherRef = useRef(options.fetcher)
  fetcherRef.current = options.fetcher

  const enablePaginationRef = useRef(options.enablePagination)
  enablePaginationRef.current = options.enablePagination

  const itemsPerPageRef = useRef(options.itemsPerPage)
  itemsPerPageRef.current = options.itemsPerPage

  const extraParamsRef = useRef(extraParams)
  extraParamsRef.current = extraParams

  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async (page: number, search: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetcherRef.current({
        search: search || undefined,
        signal: controller.signal,
        ...(enablePaginationRef.current !== false && {
          page,
          limit: itemsPerPageRef.current || 10,
        }),
        ...(extraParamsRef.current && { extraParams: extraParamsRef.current }),
      })
      if (!controller.signal.aborted) {
        setData(response.data)
        if (enablePaginationRef.current !== false) setPagination(response.meta)
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError((err as Error).message || 'Erro ao carregar os dados.')
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false)
    }
  }, [])

  // Carga inicial
  useEffect(() => {
    load(1, '')
    return () => abortRef.current?.abort()
  }, [load])

  // Re-fetch from page 1 whenever extraParams changes (skip the very first render)
  const isFirstRenderRef = useRef(true)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    setPagination((p) => ({ ...p, currentPage: 1 }))
    load(1, committedSearchRef.current)
  }, [extraParams, load])

  // submitSearch aceita um override para o caso de clear imediato (evita stale closure)
  const submitSearch = useCallback(
    (overrideValue?: string) => {
      const search = overrideValue !== undefined ? overrideValue : searchInput
      committedSearchRef.current = search
      setPagination((p) => ({ ...p, currentPage: 1 }))
      load(1, search)
    },
    [searchInput, load]
  )

  const setPage = useCallback(
    (page: number) => {
      setPagination((p) => ({ ...p, currentPage: page }))
      load(page, committedSearchRef.current)
    },
    [load]
  )

  const reload = useCallback(() => {
    load(paginationRef.current.currentPage, committedSearchRef.current)
  }, [load])

  return {
    data,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    submitSearch,
    pagination,
    setPage,
    reload,
    extraParams,
    setExtraParams,
  }
}
