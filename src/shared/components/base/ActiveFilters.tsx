import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FilterGroup } from './FilterSheet'

interface ActiveFiltersProps {
  groups: FilterGroup[]
  values: Record<string, string[]>
  onRemove: (groupKey: string, value: string) => void
  onClearAll: () => void
}

export function ActiveFilters({ groups, values, onRemove, onClearAll }: ActiveFiltersProps) {
  const { t } = useTranslation()

  const activeItems = groups.flatMap((group) =>
    (values[group.key] ?? []).map((value) => ({
      groupKey: group.key,
      groupLabel: group.label,
      value,
      valueLabel: group.options.find((o) => o.value === value)?.label ?? value,
    }))
  )

  if (activeItems.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {activeItems.map((item) => (
        <span
          key={`${item.groupKey}-${item.value}`}
          className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium"
        >
          <span className="text-muted-foreground">{item.groupLabel}:</span>{' '}
          <span>{item.valueLabel}</span>
          <button
            type="button"
            onClick={() => onRemove(item.groupKey, item.value)}
            className="ml-1 rounded-full hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
            <span className="sr-only">Remover filtro</span>
          </button>
        </span>
      ))}
      <button
        type="button"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={onClearAll}
      >
        {t('common.filter.clearAll')}
      </button>
    </div>
  )
}
