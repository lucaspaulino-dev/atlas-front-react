import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/components/ui/popover'

export interface TableFilterOption {
  value: string
  label: string
}

interface TableFilterProps {
  label: string
  options: TableFilterOption[]
  selected: string[]
  onSelectedChange: (values: string[]) => void
  disabled?: boolean
}

export function TableFilter({
  label,
  options,
  selected,
  onSelectedChange,
  disabled,
}: TableFilterProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  function handleToggle(value: string) {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((v) => v !== value))
    } else {
      onSelectedChange([...selected, value])
    }
  }

  function handleClear() {
    onSelectedChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          {label}
          {selected.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-primary-foreground">
              {selected.length}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-1">
        <div className="flex flex-col">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
            >
              <Checkbox
                checked={selected.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
                tabIndex={-1}
                aria-hidden="true"
              />
              <span>{option.label}</span>
            </button>
          ))}

          {selected.length > 0 && (
            <>
              <div className="my-1 h-px bg-border" />
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 w-full rounded-sm px-3 py-2 text-sm text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {t('common.filter.clear')}
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
