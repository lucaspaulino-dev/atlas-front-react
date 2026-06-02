import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { SearchBar, type SearchSuggestion } from './SearchBar'
import type { PaginationState } from '@/shared/hooks/useListing'

interface ListingTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  enableSearch?: boolean
  enablePagination?: boolean
  pagination?: PaginationState
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: (overrideValue?: string) => void
  searchSuggestions?: SearchSuggestion[]
  onPageChange?: (page: number) => void
  filters?: React.ReactNode
  toolbarActions?: React.ReactNode
  activeFilters?: React.ReactNode
  renderCell?: (columnId: string, row: TData) => React.ReactNode
}

export function ListingTable<TData>({
  columns,
  data,
  isLoading = false,
  enableSearch = false,
  enablePagination = false,
  pagination,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchSuggestions,
  onPageChange,
  filters,
  toolbarActions,
  activeFilters,
  renderCell,
}: ListingTableProps<TData>) {
  const { t } = useTranslation()

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div className="space-y-4">
      {enableSearch && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SearchBar
            value={searchValue}
            onChange={(v) => onSearchChange?.(v)}
            onSubmit={(override) => onSearchSubmit?.(override)}
            suggestions={searchSuggestions}
            disabled={isLoading}
          />
          {filters && <div className="flex items-center gap-2">{filters}</div>}
          {toolbarActions && <div>{toolbarActions}</div>}
        </div>
      )}

      {activeFilters && <div>{activeFilters}</div>}

      <div className="rounded-md border border-border bg-card overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-background/50 flex items-center justify-center backdrop-blur-[1px]">
            <Spinner size="lg" />
          </div>
        )}

        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {renderCell?.(cell.column.id, row.original) ??
                        flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {isLoading ? t('common.textLoaderRequest') : t('common.emptyListing')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {t('common.textPagination', {
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage <= 1 || isLoading}
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages || isLoading}
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
