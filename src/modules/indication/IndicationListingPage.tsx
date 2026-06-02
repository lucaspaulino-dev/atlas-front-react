import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, FileSearch, PlusCircle, Filter } from 'lucide-react'
import { useIndications } from './hooks/useIndication'
import { useIndicationCreate } from './hooks/useIndicationCreate'
import { ListingTable } from '@/shared/components/base/ListingTable'
import { FilterSheet, type FilterGroup } from '@/shared/components/base/FilterSheet'
import { ActiveFilters } from '@/shared/components/base/ActiveFilters'
import { ConfirmDialog } from '@/shared/components/base/ConfirmDialog'
import { FormDialog } from '@/shared/components/base/FormDialog'
import { IndicationCreateForm } from './components/IndicationCreateForm'
import { IndicationDetailSheet } from './IndicationDetailSheet'
import { Button } from '@/shared/components/ui/button'
import type { IndicationRow } from './types/indication.type'

export default function IndicationListingPage() {
  const { t } = useTranslation()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({})

  const {
    columns,
    data,
    isLoading,
    pagination,
    searchInput,
    setSearchInput,
    submitSearch,
    setPage,
    reload,
    setExtraParams,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    isDeleting,
    promptDelete,
    executeDelete,
  } = useIndications()

  const filterGroups: FilterGroup[] = useMemo(
    () => [
      {
        key: 'status',
        label: t('indicationListing.filters.status'),
        options: [
          { value: 'active', label: t('indicationListing.filters.active') },
          { value: 'inactive', label: t('indicationListing.filters.inactive') },
        ],
      },
    ],
    [t]
  )

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

  const { isFormOpened, isSubmitting, openForm, closeForm, handleSubmit } =
    useIndicationCreate(reload)

  const searchSuggestions = [
    { label: t('indicationDetail.fields.name') },
    { label: t('indicationDetail.fields.id') },
    { label: t('indicationListing.table.columns.location') },
    { label: t('indicationListing.table.columns.organization') },
  ]

  const renderCell = useCallback(
    (columnId: string, row: IndicationRow) => {
      if (columnId === 'name') {
        return (
          <span
            className="font-medium text-foreground hover:text-primary hover:underline cursor-pointer transition-colors"
            onClick={() => setSelectedId(row.id)}
          >
            {row.name}
          </span>
        )
      }
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
              onClick={() => setSelectedId(row.id)}
            >
              <FileSearch className="w-4 h-4" />
            </Button>
          </div>
        )
      }
      return null
    },
    [isLoading, promptDelete]
  )

  return (
    <div className="space-y-4">
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
        searchSuggestions={searchSuggestions}
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
        toolbarActions={
          <Button disabled={isLoading} onClick={openForm}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {t('common.newRegister')}
          </Button>
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
        title={t('indicationListing.create.title')}
        description={t('indicationListing.create.description')}
        formId="create-indication-form"
      >
        <IndicationCreateForm
          id="create-indication-form"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </FormDialog>

      <IndicationDetailSheet
        id={selectedId}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />

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
