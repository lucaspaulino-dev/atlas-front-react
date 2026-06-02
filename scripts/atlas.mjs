#!/usr/bin/env node
/**
 * Atlas CLI — module scaffolder
 *
 * Usage:
 *   node scripts/atlas.mjs create module <name>
 *   npm run atlas -- create module <name>
 *
 * Examples:
 *   npm run atlas -- create module product
 *   npm run atlas -- create module productCategory
 *   npm run atlas -- create module product-category
 */

import { mkdir, writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

// ── Colour helpers ──────────────────────────────────────────────────────────

const C = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
}

const log = {
  created: (path) => console.log(`  ${C.green('✔')} ${C.dim(path)}`),
  patched: (path) => console.log(`  ${C.yellow('~')} ${C.dim(path)} ${C.yellow('(patched)')}`),
  warn: (msg) => console.log(`  ${C.yellow('⚠')}  ${msg}`),
  error: (msg) => console.error(`  ${C.red('✘')}  ${msg}`),
  section: (title) => console.log(`\n${C.bold(title)}`),
  info: (msg) => console.log(`  ${C.dim(msg)}`),
}

// ── Name utilities ──────────────────────────────────────────────────────────

function toKebab(input) {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

function toCamel(kebab) {
  return kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function toPascal(kebab) {
  const c = toCamel(kebab)
  return c.charAt(0).toUpperCase() + c.slice(1)
}

function toPlural(kebab) {
  if (/s$/.test(kebab)) return kebab
  if (/[^aeiou]y$/.test(kebab)) return kebab.slice(0, -1) + 'ies'
  if (/[xz]$/.test(kebab) || /[cs]h$/.test(kebab)) return kebab + 'es'
  return kebab + 's'
}

// ── Template helpers ────────────────────────────────────────────────────────

function sub(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`Unknown placeholder: {{${key}}}`)
    return vars[key]
  })
}

// ── File templates ──────────────────────────────────────────────────────────

function tplType({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/types/{{kebab}}.type.ts

export interface Api{{Feature}} {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface {{Feature}}Row {
  id: number
  name: string
  createdAt: string
}

export interface Api{{Feature}}Detail {
  id: number
  name: string
  created_at: string
  updated_at: string
}
`,
    { Feature, feature, kebab }
  )
}

function tplSchema({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/schemas/{{kebab}}.schema.ts
import { z } from 'zod'
import type { TFunction } from 'i18next'

export function create{{Feature}}Schema(t: TFunction) {
  return z.object({
    name: z.string().min(1, t('{{feature}}Listing.create.form.errors.name')),
  })
}

export function update{{Feature}}Schema(t: TFunction) {
  return create{{Feature}}Schema(t)
}

export type Create{{Feature}}SchemaValues = z.infer<ReturnType<typeof create{{Feature}}Schema>>
export type Update{{Feature}}SchemaValues = z.infer<ReturnType<typeof update{{Feature}}Schema>>
`,
    { Feature, feature, kebab }
  )
}

function tplService({ Feature, feature, kebab, apiSlug, featurePlural, FeaturePlural }) {
  return sub(
    `// src/modules/{{kebab}}/services/{{kebab}}.service.ts
import { httpRequest } from '@/core/http/request.helper'
import type { FetchResponse, ListingFilter } from '@/shared/hooks/useListing'
import type { Api{{Feature}}, Api{{Feature}}Detail, {{Feature}}Row } from '../types/{{kebab}}.type'
import type { Create{{Feature}}SchemaValues, Update{{Feature}}SchemaValues } from '../schemas/{{kebab}}.schema'

interface Api{{Feature}}ListResponse {
  data: Api{{Feature}}[]
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR')
}

export async function fetch{{FeaturePlural}}(filter: ListingFilter): Promise<FetchResponse<{{Feature}}Row>> {
  const { search, page, limit, signal, extraParams } = filter
  const response = await httpRequest<Api{{Feature}}ListResponse>(
    'GET',
    '/{{apiSlug}}',
    undefined,
    { params: { page, per_page: limit, search, ...extraParams }, signal }
  )
  const rows: {{Feature}}Row[] = response.data.map((item) => ({
    id: item.id,
    name: item.name,
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

export async function fetch{{Feature}}ById(id: number, signal?: AbortSignal): Promise<Api{{Feature}}Detail> {
  const response = await httpRequest<{ data: Api{{Feature}}Detail }>(
    'GET',
    \`/{{apiSlug}}/\${id}\`,
    undefined,
    { signal }
  )
  return response.data
}

export async function create{{Feature}}(values: Create{{Feature}}SchemaValues): Promise<void> {
  await httpRequest('POST', '/{{apiSlug}}', values)
}

export async function update{{Feature}}(id: number, values: Update{{Feature}}SchemaValues): Promise<void> {
  await httpRequest('PUT', \`/{{apiSlug}}/\${id}\`, values)
}

export async function delete{{Feature}}(id: number): Promise<void> {
  await httpRequest('DELETE', \`/{{apiSlug}}/\${id}\`)
}
`,
    { Feature, feature, kebab, apiSlug, featurePlural, FeaturePlural }
  )
}

function tplHookListing({ Feature, feature, kebab, featurePlural, FeaturePlural }) {
  return sub(
    `// src/modules/{{kebab}}/hooks/use{{FeaturePlural}}.ts
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { {{Feature}}Row } from '../types/{{kebab}}.type'
import { useListing } from '@/shared/hooks/useListing'
import { toast } from '@/shared/components/ui/toast/use-toast'
import { fetch{{FeaturePlural}}, delete{{Feature}} } from '../services/{{kebab}}.service'

export function use{{FeaturePlural}}() {
  const { t } = useTranslation()

  const columns: ColumnDef<{{Feature}}Row>[] = [
    { accessorKey: 'name', header: t('{{feature}}Listing.table.columns.name') },
    { accessorKey: 'createdAt', header: t('{{feature}}Listing.table.columns.createdAt') },
    { id: 'actions', header: t('{{feature}}Listing.table.columns.actions') },
  ]

  const { data, isLoading, pagination, searchInput, setSearchInput, submitSearch, setExtraParams, setPage, reload } =
    useListing<{{Feature}}Row>({ fetcher: fetch{{FeaturePlural}}, enablePagination: true })

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{{Feature}}Row | null>(null)

  const promptDelete = useCallback((row: {{Feature}}Row) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }, [])

  const executeDelete = useCallback(async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await delete{{Feature}}(itemToDelete.id)
      reload()
      setIsConfirmDialogOpen(false)
      setItemToDelete(null)
      toast({ title: t('common.success'), description: t('common.updateMessage'), variant: 'success' })
    } catch {
      toast({ title: t('common.error'), description: t('common.errorMessage'), variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }, [itemToDelete, reload, t])

  return {
    columns,
    data,
    isLoading,
    pagination,
    searchInput,
    setSearchInput,
    submitSearch,
    setExtraParams,
    setPage,
    reload,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    isDeleting,
    promptDelete,
    executeDelete,
  }
}
`,
    { Feature, feature, kebab, featurePlural, FeaturePlural }
  )
}

function tplHookCreate({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/hooks/use{{Feature}}Create.ts
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Create{{Feature}}SchemaValues } from '../schemas/{{kebab}}.schema'
import { toast } from '@/shared/components/ui/toast/use-toast'
import { create{{Feature}} } from '../services/{{kebab}}.service'

export function use{{Feature}}Create(onSuccess?: () => void) {
  const { t } = useTranslation()
  const [isFormOpened, setIsFormOpened] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openForm = useCallback(() => setIsFormOpened(true), [])
  const closeForm = useCallback(() => setIsFormOpened(false), [])

  const handleSubmit = useCallback(
    async (values: Create{{Feature}}SchemaValues) => {
      setIsSubmitting(true)
      try {
        await create{{Feature}}(values)
        toast({ title: t('common.success'), description: t('common.updateMessage'), variant: 'success' })
        closeForm()
        onSuccess?.()
      } catch {
        toast({ title: t('common.error'), description: t('common.errorMessage'), variant: 'destructive' })
      } finally {
        setIsSubmitting(false)
      }
    },
    [closeForm, onSuccess, t]
  )

  return { isFormOpened, isSubmitting, openForm, closeForm, handleSubmit }
}
`,
    { Feature, feature, kebab }
  )
}

function tplHookEdit({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/hooks/use{{Feature}}Edit.ts
import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Update{{Feature}}SchemaValues } from '../schemas/{{kebab}}.schema'
import type { Api{{Feature}}Detail } from '../types/{{kebab}}.type'
import { toast } from '@/shared/components/ui/toast/use-toast'
import { update{{Feature}} } from '../services/{{kebab}}.service'

export function use{{Feature}}Edit(onSuccess?: () => void) {
  const { t } = useTranslation()
  const [isFormOpened, setIsFormOpened] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editTarget, setEditTarget] = useState<Api{{Feature}}Detail | null>(null)

  const openForm = useCallback((item: Api{{Feature}}Detail) => {
    setEditTarget(item)
    setIsFormOpened(true)
  }, [])

  const closeForm = useCallback(() => {
    setIsFormOpened(false)
    // editTarget mantido até o próximo openForm para a animação de saída do Radix terminar
  }, [])

  const handleSubmit = useCallback(
    async (values: Update{{Feature}}SchemaValues) => {
      if (!editTarget) return
      setIsSubmitting(true)
      try {
        await update{{Feature}}(editTarget.id, values)
        toast({ title: t('common.success'), description: t('common.updateMessage'), variant: 'success' })
        closeForm()
        onSuccess?.()
      } catch {
        toast({ title: t('common.error'), description: t('common.errorMessage'), variant: 'destructive' })
      } finally {
        setIsSubmitting(false)
      }
    },
    [editTarget, closeForm, onSuccess, t]
  )

  return { isFormOpened, isSubmitting, editTarget, openForm, closeForm, handleSubmit }
}
`,
    { Feature, feature, kebab }
  )
}

function tplHookDetail({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/hooks/use{{Feature}}Detail.ts
import { useState, useEffect, useRef, useCallback } from 'react'
import type { Api{{Feature}}Detail } from '../types/{{kebab}}.type'
import { fetch{{Feature}}ById } from '../services/{{kebab}}.service'

export function use{{Feature}}Detail(id: number) {
  const [data, setData] = useState<Api{{Feature}}Detail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    // Rejeita IDs inválidos antes de emitir qualquer requisição.
    // Number(undefined) e Number('abc') produzem NaN — sem esse guard
    // o hook emitiria GET /<endpoint>/NaN para a API.
    if (!Number.isInteger(id) || id <= 0) {
      setIsLoading(false)
      setError('invalid_id')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)
    try {
      const raw = await fetch{{Feature}}ById(id, controller.signal)
      if (!controller.signal.aborted) setData(raw)
    } catch (e) {
      if (!controller.signal.aborted) {
        // Nunca exponha e.message na UI — a mensagem é controlada pela API.
        // Logue para diagnóstico e armazene apenas um sentinel.
        console.error('[use{{Feature}}Detail]', e)
        setError('fetch_failed')
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
    return () => abortRef.current?.abort()
  }, [load])

  return { data, isLoading, error, reload: load }
}
`,
    { Feature, feature, kebab }
  )
}

function tplHookFormOptions({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/hooks/use{{Feature}}FormOptions.ts
import { useState, useEffect } from 'react'

export interface SelectOption {
  id: number
  name: string
}

// TODO: import fetch functions from '../services/{{kebab}}.service' as needed
export function use{{Feature}}FormOptions() {
  const [options, setOptions] = useState<SelectOption[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoadingOptions(true)

    // TODO: replace with real fetch call(s), using Promise.all for multiple groups
    Promise.resolve([])
      .then((list) => {
        setOptions(list)
        setIsLoadingOptions(false)
      })
      .catch((e) => {
        if (e instanceof Error && e.message !== 'canceled') {
          setOptionsError(e.message)
          setIsLoadingOptions(false)
        }
      })

    return () => controller.abort()
  }, [])

  return { options, isLoadingOptions, optionsError }
}
`,
    { Feature, feature, kebab }
  )
}


function tplCreateForm({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/components/{{Feature}}CreateForm.tsx
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { create{{Feature}}Schema, type Create{{Feature}}SchemaValues } from '../schemas/{{kebab}}.schema'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

interface {{Feature}}CreateFormProps {
  id: string
  isSubmitting: boolean
  onSubmit: (values: Create{{Feature}}SchemaValues) => void
}

export function {{Feature}}CreateForm({ id, isSubmitting, onSubmit }: {{Feature}}CreateFormProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => create{{Feature}}Schema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Create{{Feature}}SchemaValues>({
    resolver: zodResolver(schema),
  })

  return (
    <form id={id} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">{t('{{feature}}Listing.create.form.name.label')}</Label>
        <Input
          id="name"
          placeholder={t('{{feature}}Listing.create.form.name.placeholder')}
          disabled={isSubmitting}
          {...register('name')}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
    </form>
  )
}
`,
    { Feature, feature, kebab }
  )
}

function tplEditForm({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/components/{{Feature}}EditForm.tsx
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { update{{Feature}}Schema, type Update{{Feature}}SchemaValues } from '../schemas/{{kebab}}.schema'
import type { Api{{Feature}}Detail } from '../types/{{kebab}}.type'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

interface {{Feature}}EditFormProps {
  id: string
  isSubmitting: boolean
  initialData: Api{{Feature}}Detail
  onSubmit: (values: Update{{Feature}}SchemaValues) => void
}

export function {{Feature}}EditForm({ id, isSubmitting, initialData, onSubmit }: {{Feature}}EditFormProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => update{{Feature}}Schema(t), [t])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Update{{Feature}}SchemaValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialData.name },
  })

  return (
    <form id={id} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="edit-name">{t('{{feature}}Listing.create.form.name.label')}</Label>
        <Input id="edit-name" disabled={isSubmitting} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
    </form>
  )
}
`,
    { Feature, feature, kebab }
  )
}

function tplMainContainer({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/containers/{{Feature}}MainContainer.tsx
import { useTranslation } from 'react-i18next'
import { DetailContainer, DetailField } from '@/shared/components/base/DetailContainer'
import type { Api{{Feature}}Detail } from '../types/{{kebab}}.type'

interface Props {
  data: Api{{Feature}}Detail
  onEdit?: () => void
}

export function {{Feature}}MainContainer({ data, onEdit }: Props) {
  const { t } = useTranslation()

  return (
    <DetailContainer title={t('{{feature}}Detail.sections.main')} onEdit={onEdit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailField label={t('{{feature}}Detail.fields.id')} value={data.id} />
        <DetailField label={t('{{feature}}Detail.fields.name')} value={data.name} />
      </div>
    </DetailContainer>
  )
}
`,
    { Feature, feature, kebab }
  )
}

function tplListingPage({ Feature, feature, kebab, featurePlural, FeaturePlural }) {
  return sub(
    `// src/modules/{{kebab}}/{{Feature}}ListingPage.tsx
import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Trash2, FileSearch, PlusCircle, Filter } from 'lucide-react'
import { use{{FeaturePlural}} } from './hooks/use{{FeaturePlural}}'
import { use{{Feature}}Create } from './hooks/use{{Feature}}Create'
import { ListingTable } from '@/shared/components/base/ListingTable'
import { FilterSheet, type FilterGroup } from '@/shared/components/base/FilterSheet'
import { ActiveFilters } from '@/shared/components/base/ActiveFilters'
import { ConfirmDialog } from '@/shared/components/base/ConfirmDialog'
import { FormDialog } from '@/shared/components/base/FormDialog'
import { {{Feature}}CreateForm } from './components/{{Feature}}CreateForm'
import { Button } from '@/shared/components/ui/button'
import type { {{Feature}}Row } from './types/{{kebab}}.type'

export default function {{Feature}}ListingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    columns,
    data,
    isLoading,
    pagination,
    searchInput,
    setSearchInput,
    submitSearch,
    setExtraParams,
    setPage,
    reload,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    isDeleting,
    promptDelete,
    executeDelete,
  } = use{{FeaturePlural}}()

  const { isFormOpened, isSubmitting, openForm, closeForm, handleSubmit } =
    use{{Feature}}Create(reload)

  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({})

  const filterGroups: FilterGroup[] = useMemo(() => [], [])

  const activeFilterCount = Object.values(appliedFilters).flat().length

  function handleApplyFilters(draft: Record<string, string[]>) {
    setAppliedFilters(draft)
    setFilterSheetOpen(false)
    const extra: Record<string, string[]> = {}
    for (const [key, vals] of Object.entries(draft)) {
      if (vals.length > 0) extra[key] = vals
    }
    setExtraParams(Object.keys(extra).length > 0 ? extra : undefined)
  }

  function handleRemoveFilter(groupKey: string, value: string) {
    const updated = {
      ...appliedFilters,
      [groupKey]: (appliedFilters[groupKey] ?? []).filter((v) => v !== value),
    }
    handleApplyFilters(updated)
  }

  function handleClearAllFilters() {
    handleApplyFilters({})
  }

  const renderCell = useCallback(
    (columnId: string, row: {{Feature}}Row) => {
      if (columnId === 'actions') {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              disabled={isLoading}
              onClick={() => promptDelete(row)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={() => navigate(\`/{{kebab}}/\${row.id}\`)}
            >
              <FileSearch className="w-4 h-4" />
            </Button>
          </div>
        )
      }
      return null
    },
    [isLoading, navigate, promptDelete]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('{{feature}}Listing.page.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('{{feature}}Listing.page.description')}</p>
        </div>
        <Button disabled={isLoading} onClick={openForm}>
          <PlusCircle className="w-4 h-4 mr-2" />
          {t('common.newRegister')}
        </Button>
      </div>
      <ListingTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        enableSearch
        enablePagination
        pagination={pagination}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={submitSearch}
        onPageChange={setPage}
        renderCell={renderCell}
        filters={
          <Button variant="outline" disabled={isLoading} onClick={() => setFilterSheetOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            {t('common.filters')}
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        }
        activeFilters={
          <ActiveFilters
            groups={filterGroups}
            values={appliedFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        }
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title={t('common.delete.title')}
        description={t('common.delete.message')}
        confirmText={t('common.delete.confirm')}
        cancelText={t('common.delete.cancel')}
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={executeDelete}
      />

      <FormDialog
        open={isFormOpened}
        onOpenChange={closeForm}
        isLoading={isSubmitting}
        title={t('{{feature}}Listing.create.title')}
        description={t('{{feature}}Listing.create.description')}
        formId="create-{{kebab}}-form"
      >
        <{{Feature}}CreateForm
          id="create-{{kebab}}-form"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </FormDialog>

      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        groups={filterGroups}
        values={appliedFilters}
        onApply={handleApplyFilters}
        disabled={isLoading}
      />
    </div>
  )
}
`,
    { Feature, feature, kebab, featurePlural, FeaturePlural }
  )
}

function tplDetailPage({ Feature, feature, kebab }) {
  return sub(
    `// src/modules/{{kebab}}/{{Feature}}DetailPage.tsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { useBreadcrumbStore } from '@/core/store/breadcrumb.store'
import { FormDialog } from '@/shared/components/base/FormDialog'
import { {{Feature}}MainContainer } from './containers/{{Feature}}MainContainer'
import { {{Feature}}EditForm } from './components/{{Feature}}EditForm'
import { use{{Feature}}Detail } from './hooks/use{{Feature}}Detail'
import { use{{Feature}}Edit } from './hooks/use{{Feature}}Edit'

export default function {{Feature}}DetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error, reload } = use{{Feature}}Detail(Number(id))
  const { isFormOpened, isSubmitting, editTarget, openForm, closeForm, handleSubmit } =
    use{{Feature}}Edit(reload)

  const setTitle = useBreadcrumbStore((s) => s.setTitle)
  const clearTitle = useBreadcrumbStore((s) => s.clearTitle)

  useEffect(() => {
    // Identifique o campo primário não-nulo do recurso e use-o como breadcrumb.
    // - Se "name" nunca é null: setTitle(data.name)
    // - Se "name" é string | null e existe campo alternativo (ex: acronym, code, ip):
    //   setTitle(data.acronym)
    // - Se não há alternativa: setTitle(data.name ?? String(data.id))
    if (data) setTitle(data.name)
    return () => clearTitle()
  }, [data, setTitle, clearTitle])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        {/* Nunca renderize \`error\` diretamente — o valor é um sentinel interno do hook,
            não uma mensagem para o usuário. Use sempre a chave i18n. */}
        <span className="text-sm text-destructive">{t('common.errorMessage')}</span>
        <Button variant="ghost" size="sm" onClick={() => navigate('/{{kebab}}')}>
          {t('{{feature}}Detail.backToList')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <{{Feature}}MainContainer data={data} onEdit={() => openForm(data)} />

      <FormDialog
        open={isFormOpened}
        onOpenChange={closeForm}
        isLoading={isSubmitting}
        title={t('{{feature}}Listing.edit.title')}
        description={t('{{feature}}Listing.edit.description')}
        formId="edit-{{kebab}}-form"
      >
        {editTarget && (
          <{{Feature}}EditForm
            id="edit-{{kebab}}-form"
            isSubmitting={isSubmitting}
            initialData={editTarget}
            onSubmit={handleSubmit}
          />
        )}
      </FormDialog>
    </div>
  )
}
`,
    { Feature, feature, kebab }
  )
}

function tplI18nListing({ Feature, feature, kebab }) {
  return JSON.stringify(
    {
      'pt-BR': {
        [`${feature}Listing`]: {
          page: {
            title: `${Feature}`,
            description: `Gerencie os registros de ${Feature}`,
          },
          table: {
            columns: {
              name: 'Nome',
              createdAt: 'Data de criação',
              actions: 'Ações',
            },
          },
          create: {
            title: `${Feature}`,
            description: `Crie um novo registro de ${Feature}`,
            form: {
              name: {
                label: 'Nome',
                placeholder: `Digite o nome`,
              },
              errors: {
                name: 'O nome deve ter no mínimo 1 caractere.',
              },
            },
          },
          edit: {
            title: `Editar ${Feature}`,
            description: `Atualize os dados de ${Feature}`,
          },
        },
      },
      'en-US': {
        [`${feature}Listing`]: {
          page: {
            title: `${Feature}`,
            description: `Manage the ${Feature} records`,
          },
          table: {
            columns: {
              name: 'Name',
              createdAt: 'Creation date',
              actions: 'Actions',
            },
          },
          create: {
            title: `${Feature}`,
            description: `Create a new ${Feature} record`,
            form: {
              name: {
                label: 'Name',
                placeholder: `Enter the name`,
              },
              errors: {
                name: 'The name must have at least 1 character.',
              },
            },
          },
          edit: {
            title: `Edit ${Feature}`,
            description: `Update ${Feature} data`,
          },
        },
      },
      'es-ES': {
        [`${feature}Listing`]: {
          page: {
            title: `${Feature}`,
            description: `Gestione los registros de ${Feature}`,
          },
          table: {
            columns: {
              name: 'Nombre',
              createdAt: 'Fecha de creación',
              actions: 'Acciones',
            },
          },
          create: {
            title: `${Feature}`,
            description: `Crea un nuevo registro de ${Feature}`,
            form: {
              name: {
                label: 'Nombre',
                placeholder: `Ingrese el nombre`,
              },
              errors: {
                name: 'El nombre debe tener al menos 1 carácter.',
              },
            },
          },
          edit: {
            title: `Editar ${Feature}`,
            description: `Actualiza los datos de ${Feature}`,
          },
        },
      },
    },
    null,
    2
  )
}

function tplI18nDetail({ Feature, feature }) {
  return (
    JSON.stringify(
      {
        'pt-BR': {
          [`${feature}Detail`]: {
            breadcrumb: `Detalhes de ${Feature}`,
            edit: 'Editar',
            backToList: 'Voltar à lista',
            sections: { main: 'Dados Gerais' },
            fields: { id: 'ID', name: 'Nome', createdAt: 'Criado em', updatedAt: 'Atualizado em' },
          },
        },
        'en-US': {
          [`${feature}Detail`]: {
            breadcrumb: `${Feature} Details`,
            edit: 'Edit',
            backToList: 'Back to list',
            sections: { main: 'General Data' },
            fields: { id: 'ID', name: 'Name', createdAt: 'Created at', updatedAt: 'Updated at' },
          },
        },
        'es-ES': {
          [`${feature}Detail`]: {
            breadcrumb: `Detalles de ${Feature}`,
            edit: 'Editar',
            backToList: 'Volver a la lista',
            sections: { main: 'Datos Generales' },
            fields: { id: 'ID', name: 'Nombre', createdAt: 'Creado en', updatedAt: 'Actualizado en' },
          },
        },
      },
      null,
      2
    ) + '\n'
  )
}

// ── i18n/index.ts patch ─────────────────────────────────────────────────────

async function patchI18n(feature, kebab, i18nPath) {
  let content = await readFile(i18nPath, 'utf-8')

  const detailImport = `import ${feature}Detail from '@/mock/languages/${kebab}/${kebab}-detail.json'`
  const listingImport = `import ${feature}Listing from '@/mock/languages/${kebab}/${kebab}-listing.json'`

  if (content.includes(listingImport)) {
    return { patched: false, reason: 'imports already present' }
  }

  content = content.replace(
    `import menu from`,
    `${detailImport}\n${listingImport}\nimport menu from`
  )

  content = content.replace(
    `  ...menu[lang as keyof typeof menu],`,
    `  ...${feature}Detail[lang as keyof typeof ${feature}Detail],\n  ...${feature}Listing[lang as keyof typeof ${feature}Listing],\n  ...menu[lang as keyof typeof menu],`
  )

  await writeFile(i18nPath, content, 'utf-8')
  return { patched: true }
}

// ── Router patch ────────────────────────────────────────────────────────────

async function patchRouter(Feature, feature, kebab, routerPath) {
  let content = await readFile(routerPath, 'utf-8')

  // ── Insert imports ──────────────────────────────────────────────────────
  const listingImport = `import ${Feature}ListingPage from '@/modules/${kebab}/${Feature}ListingPage'`
  const detailImport = `import ${Feature}DetailPage from '@/modules/${kebab}/${Feature}DetailPage'`

  if (content.includes(listingImport)) {
    return { patched: false, reason: 'imports already present' }
  }

  // Insert before the blank line that precedes 'export const router'
  const exportMarker = '\n\nexport const router'
  const exportIdx = content.indexOf(exportMarker)
  if (exportIdx === -1) {
    return { patched: false, reason: 'could not locate export const router' }
  }

  content =
    content.slice(0, exportIdx) +
    `\nimport ${Feature}ListingPage from '@/modules/${kebab}/${Feature}ListingPage'\nimport ${Feature}DetailPage from '@/modules/${kebab}/${Feature}DetailPage'` +
    content.slice(exportIdx)

  // ── Insert route entry ──────────────────────────────────────────────────
  // Find the inner children array — look for the last route entry and append after it.
  // Strategy: find '{ path: \'turismo\'' or any last-child pattern — insert a new route block
  // before the closing `],` of the MainLayout children.
  //
  // We look for the pattern:        { path: 'turismo', ... },\n        ],
  // and insert our new route before the `        ],`

  const routeBlock = `          {
            path: '${kebab}',
            handle: { breadcrumb: 'menu.${feature}' },
            children: [
              { index: true, element: <${Feature}ListingPage /> },
              {
                path: ':id',
                handle: { dynamicBreadcrumb: true },
                element: <${Feature}DetailPage />,
              },
            ],
          },`

  // Find the closing of the MainLayout children by looking for `        ],` after the last route
  // We search for the pattern: closing of inner children array (8 spaces + `],`)
  const innerChildrenClose = '\n        ],\n      },\n    ],\n  },\n  {\n    path: \'/login\''
  const closeIdx = content.indexOf(innerChildrenClose)

  if (closeIdx === -1) {
    return { patched: false, reason: 'could not locate MainLayout children closing bracket' }
  }

  content =
    content.slice(0, closeIdx) + '\n' + routeBlock + content.slice(closeIdx)

  await writeFile(routerPath, content, 'utf-8')
  return { patched: true }
}

// ── Main orchestrator ───────────────────────────────────────────────────────

async function createModule(name) {
  // ── Derive naming ─────────────────────────────────────────────────────────
  const kebab = toKebab(name)
  const feature = toCamel(kebab)
  const Feature = toPascal(kebab)
  const apiSlug = toPlural(kebab)
  const featurePlural = feature.endsWith('s') ? feature : feature + 's'
  const FeaturePlural = Feature.endsWith('s') ? Feature : Feature + 's'
  const vars = { Feature, feature, kebab, apiSlug, featurePlural, FeaturePlural }

  console.log(
    `\n${C.bold('Atlas')} ${C.cyan('create module')} ${C.bold(name)}\n` +
      C.dim(
        `  folder   src/modules/${kebab}/\n` +
          `  Feature  ${Feature}\n` +
          `  feature  ${feature}\n` +
          `  apiSlug  /${apiSlug}\n`
      )
  )

  // ── Guard: already exists ─────────────────────────────────────────────────
  const modulePath = join('src', 'modules', kebab)
  if (existsSync(modulePath)) {
    log.error(`Module "${kebab}" already exists at ${modulePath}`)
    process.exit(1)
  }

  // ── Create directories ────────────────────────────────────────────────────
  await mkdir(join(modulePath, 'types'), { recursive: true })
  await mkdir(join(modulePath, 'schemas'), { recursive: true })
  await mkdir(join(modulePath, 'services'), { recursive: true })
  await mkdir(join(modulePath, 'hooks'), { recursive: true })
  await mkdir(join(modulePath, 'components'), { recursive: true })
  await mkdir(join(modulePath, 'containers'), { recursive: true })
  await mkdir(join('src', 'mock', 'languages', kebab), { recursive: true })

  // ── Write 13 source files ─────────────────────────────────────────────────
  log.section('Generating module files')

  const files = [
    { path: join(modulePath, 'types', `${kebab}.type.ts`), content: tplType(vars) },
    { path: join(modulePath, 'schemas', `${kebab}.schema.ts`), content: tplSchema(vars) },
    { path: join(modulePath, 'services', `${kebab}.service.ts`), content: tplService(vars) },
    { path: join(modulePath, 'hooks', `use${FeaturePlural}.ts`), content: tplHookListing(vars) },
    { path: join(modulePath, 'hooks', `use${Feature}Create.ts`), content: tplHookCreate(vars) },
    { path: join(modulePath, 'hooks', `use${Feature}Edit.ts`), content: tplHookEdit(vars) },
    { path: join(modulePath, 'hooks', `use${Feature}Detail.ts`), content: tplHookDetail(vars) },
    {
      path: join(modulePath, 'hooks', `use${Feature}FormOptions.ts`),
      content: tplHookFormOptions(vars),
    },
    {
      path: join(modulePath, 'components', `${Feature}CreateForm.tsx`),
      content: tplCreateForm(vars),
    },
    {
      path: join(modulePath, 'components', `${Feature}EditForm.tsx`),
      content: tplEditForm(vars),
    },
    {
      path: join(modulePath, 'containers', `${Feature}MainContainer.tsx`),
      content: tplMainContainer(vars),
    },
    { path: join(modulePath, `${Feature}ListingPage.tsx`), content: tplListingPage(vars) },
    { path: join(modulePath, `${Feature}DetailPage.tsx`), content: tplDetailPage(vars) },
  ]

  for (const { path, content } of files) {
    await writeFile(path, content, 'utf-8')
    log.created(path)
  }

  // ── i18n: listing + detail files ─────────────────────────────────────────
  log.section('Generating i18n files')

  const listingJsonPath = join('src', 'mock', 'languages', kebab, `${kebab}-listing.json`)
  await writeFile(listingJsonPath, tplI18nListing(vars) + '\n', 'utf-8')
  log.created(listingJsonPath)

  const detailJsonPath = join('src', 'mock', 'languages', kebab, `${kebab}-detail.json`)
  await writeFile(detailJsonPath, tplI18nDetail(vars), 'utf-8')
  log.created(detailJsonPath)

  // ── i18n: patch index.ts ──────────────────────────────────────────────────
  const i18nPath = join('src', 'core', 'i18n', 'index.ts')
  const i18nResult = await patchI18n(feature, kebab, i18nPath)
  if (i18nResult.patched) {
    log.patched(i18nPath)
  } else {
    log.warn(`i18n not patched automatically: ${i18nResult.reason}`)
  }

  // ── Router: auto-patch ────────────────────────────────────────────────────
  log.section('Patching router')

  const routerPath = join('src', 'core', 'router', 'index.tsx')
  const routerResult = await patchRouter(Feature, feature, kebab, routerPath)

  if (routerResult.patched) {
    log.patched(routerPath)
  } else {
    log.warn(`Router not patched automatically: ${routerResult.reason}`)
    log.info(`Add these imports to ${routerPath}:`)
    console.log(
      C.dim(
        `  import ${Feature}ListingPage from '@/modules/${kebab}/${Feature}ListingPage'\n` +
          `  import ${Feature}DetailPage from '@/modules/${kebab}/${Feature}DetailPage'`
      )
    )
    log.info(`Add this route inside the MainLayout children array:`)
    console.log(
      C.dim(`  {
    path: '${kebab}',
    handle: { breadcrumb: 'menu.${feature}' },
    children: [
      { index: true, element: <${Feature}ListingPage /> },
      { path: ':id', handle: { dynamicBreadcrumb: true }, element: <${Feature}DetailPage /> },
    ],
  },`)
    )
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${C.green('✔')} ${C.bold(`Module "${Feature}" created successfully`)}\n`)
  console.log(C.dim('Next steps:'))
  console.log(
    C.dim(
      `  1. Review the API endpoint in services/${kebab}.service.ts (current: /${apiSlug})\n` +
        `  2. Update the route path in the router if needed (current: /${kebab})\n` +
        `  3. Add menu.${feature} key to src/mock/languages/menu/menu.json\n` +
        `  4. Fill in custom fields in types, schemas, forms, and containers\n` +
        `  5. Adjust i18n keys in src/mock/languages/${kebab}/${kebab}-detail.json and ${kebab}-listing.json\n` +
        `  6. Run: npm run dev`
    )
  )
}

// ── CLI entrypoint ──────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
${C.bold('Atlas CLI')} — project scaffolder

${C.bold('Usage:')}
  node scripts/atlas.mjs <command> <subcommand> [args]
  npm run atlas -- <command> <subcommand> [args]

${C.bold('Commands:')}
  create module <name>    Scaffold a full CRUD module

${C.bold('Examples:')}
  npm run atlas -- create module product
  npm run atlas -- create module productCategory
  npm run atlas -- create module product-category
`)
}

const [, , command, subcommand, ...rest] = process.argv

if (!command || command === '--help' || command === '-h') {
  printHelp()
  process.exit(0)
}

if (command === 'create' && subcommand === 'module') {
  const name = rest[0]
  if (!name) {
    log.error('Module name is required.\n  Usage: atlas create module <name>')
    process.exit(1)
  }
  if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(name)) {
    log.error('Module name must start with a letter and contain only letters, numbers, hyphens, or underscores.')
    process.exit(1)
  }
  createModule(name).catch((err) => {
    log.error(err.message)
    process.exit(1)
  })
} else {
  log.error(`Unknown command: ${command} ${subcommand ?? ''}`)
  printHelp()
  process.exit(1)
}
