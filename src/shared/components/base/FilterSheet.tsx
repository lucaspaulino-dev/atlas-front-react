import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'

export interface FilterGroup {
  key: string
  label: string
  options: { value: string; label: string }[]
}

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: FilterGroup[]
  values: Record<string, string[]>
  onApply: (draft: Record<string, string[]>) => void
  disabled?: boolean
}

export function FilterSheet({
  open,
  onOpenChange,
  groups,
  values,
  onApply,
  disabled,
}: FilterSheetProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<Record<string, string[]>>(values)

  function handleToggle(groupKey: string, value: string) {
    setDraft((prev) => {
      const current = prev[groupKey] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [groupKey]: next }
    })
  }

  function handleClearDraft() {
    setDraft({})
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col max-w-sm">
        <SheetHeader>
          <SheetTitle>{t('common.filters')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="text-sm font-medium mb-3">{group.label}</p>
              <div className="space-y-2">
                {group.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={(draft[group.key] ?? []).includes(option.value)}
                      onCheckedChange={() => handleToggle(group.key, option.value)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleClearDraft}>
            {t('common.filter.clearAll')}
          </Button>
          <Button onClick={() => onApply(draft)} disabled={disabled}>
            {t('common.filter.apply')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
