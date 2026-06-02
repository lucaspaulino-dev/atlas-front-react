import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'

export interface SearchSuggestion {
  label: string
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  // overrideValue: passado quando o valor submetido difere do state atual (ex: clear)
  onSubmit: (overrideValue?: string) => void
  suggestions?: SearchSuggestion[]
  placeholder?: string
  disabled?: boolean
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  placeholder,
  disabled,
}: SearchBarProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const showDropdown = isOpen && value.trim().length > 0 && suggestions.length > 0

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleChange(newValue: string) {
    onChange(newValue)
    setIsOpen(newValue.length > 0)
  }

  function handleClear() {
    onChange('')
    setIsOpen(false)
    onSubmit('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setIsOpen(false)
      onSubmit()
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function handleSubmitClick() {
    setIsOpen(false)
    onSubmit()
  }

  function handleSuggestionClick() {
    setIsOpen(false)
    onSubmit()
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <div className="relative">
        <Input
          value={value}
          placeholder={placeholder ?? t('common.searchPlaceholder')}
          className="w-72 pr-8"
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length > 0 && suggestions.length > 0 && setIsOpen(true)}
          autoComplete="off"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-full z-50 bg-card border border-border rounded-md shadow-md overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={handleSuggestionClick}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>
                  <span className="text-muted-foreground">{s.label}:</span>{' '}
                  <span className="font-medium text-foreground">{value}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button type="button" onClick={handleSubmitClick} disabled={disabled}>
        <Search className="w-4 h-4 mr-2" />
        {t('common.search')}
      </Button>
    </div>
  )
}
