import { useState, useRef, useEffect } from 'react'
import { useMatches, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { useBreadcrumbStore } from '@/core/store/breadcrumb.store'

type RouteHandle = { breadcrumb?: string; dynamicBreadcrumb?: boolean }

export function AppHeader() {
  const { t } = useTranslation()
  const matches = useMatches()
  const navigate = useNavigate()
  const dynamicTitle = useBreadcrumbStore((s) => s.title)

  const breadcrumbs = matches
    .filter((m) => {
      const h = m.handle as RouteHandle
      return h?.breadcrumb || h?.dynamicBreadcrumb
    })
    .map((m) => {
      const h = m.handle as RouteHandle
      return {
        path: m.pathname,
        label: h.dynamicBreadcrumb ? (dynamicTitle ?? '…') : t(h.breadcrumb!),
      }
    })

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('atlas-token')
    window.location.href = '/login'
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 py-2 shadow-sm">
      {breadcrumbs.length > 0 ? (
        <nav className="flex items-center text-xl" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="flex items-center">
              {index > 0 && <span className="mx-2 font-bold text-foreground">/</span>}
              {index < breadcrumbs.length - 1 ? (
                <button
                  type="button"
                  className="text-muted-foreground font-medium hover:text-foreground transition-colors"
                  onClick={() => navigate(crumb.path)}
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-foreground font-bold">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-12">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Avatar className="w-9 h-9 border border-border cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src="https://github.com/shadcn.png" alt="Foto do usuário" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                AD
              </AvatarFallback>
            </Avatar>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-md z-50 py-1">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">
                  {t('common.header.user.name')}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('common.header.user.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
