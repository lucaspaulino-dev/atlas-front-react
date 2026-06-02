import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { ColumnDef } from '@tanstack/react-table'
import type { IndicationRow } from '../types/indication.type'
import { useListing } from '@/shared/hooks/useListing'
import { toast } from '@/shared/components/ui/toast/use-toast'
import { fetchIndications, deleteIndication } from '../services/indication.service'

export function useIndications() {
  const { t } = useTranslation()

  const columns: ColumnDef<IndicationRow>[] = [
    { accessorKey: 'name', header: t('indicationListing.table.columns.name') },
    { accessorKey: 'organizationId', header: t('indicationListing.table.columns.organization') },
    { accessorKey: 'cityId', header: t('indicationListing.table.columns.location') },
    { accessorKey: 'concessionDate', header: t('indicationListing.table.columns.concessionDate') },
    { accessorKey: 'createdAt', header: t('indicationListing.table.columns.createdAt') },
    { id: 'actions', header: t('indicationListing.table.columns.actions') },
  ]

  const {
    data,
    isLoading,
    pagination,
    searchInput,
    setSearchInput,
    submitSearch,
    setPage,
    reload,
    setExtraParams,
  } = useListing<IndicationRow>({ fetcher: fetchIndications, enablePagination: true })

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<IndicationRow | null>(null)

  const promptDelete = useCallback((row: IndicationRow) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }, [])

  const executeDelete = useCallback(async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await deleteIndication(itemToDelete.id)
      reload()
      setIsConfirmDialogOpen(false)
      setItemToDelete(null)
      toast({
        title: t('common.success'),
        description: t('common.updateMessage'),
        variant: 'success',
      })
    } catch {
      toast({
        title: t('common.error'),
        description: t('common.errorMessage'),
        variant: 'destructive',
      })
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
    setPage,
    reload,
    setExtraParams,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    isDeleting,
    promptDelete,
    executeDelete,
  }
}
