import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CircleHelp,
  LayoutDashboard,
  Home,
  GlobeIcon,
  Store,
  Backpack,
  Settings,
} from 'lucide-react'
import logoLight from '@/assets/img/geral/logo.png'
import logoDark from '@/assets/img/geral/logo-dark.png'
import { useThemeStore } from '@/core/store/theme.store'

const menuItems = (t: (key: string) => string) => [
  { name: t('menu.dashboard'), icon: LayoutDashboard, path: '/' },
  { name: t('menu.companies'), icon: Home, path: '/empresas' },
  { name: t('menu.indication'), icon: GlobeIcon, path: '/indicacao-geografica' },
  { name: t('menu.segmentation'), icon: Store, path: '/segmentacao-de-loja' },
  { name: t('menu.tourism'), icon: Backpack, path: '/turismo' },
  { name: t('menu.branding'), icon: Settings, path: '/configuracoes' },
]

export function SideBar() {
  const { t } = useTranslation()
  const { theme } = useThemeStore()
  const items = menuItems(t)

  return (
    <aside className="w-64 bg-card border-border flex flex-col border-r shadow-sm">
      <div className="flex items-center p-6 mb-1">
        <img
          src={theme === 'dark' ? logoDark : logoLight}
          alt="Atlas Territorial do Turismo"
          className="h-auto w-full max-w-[180px]"
        />
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-xs">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              [
                'flex items-center justify-between py-4 border-b transition-colors text-base font-medium',
                isActive
                  ? 'text-primary border-primary'
                  : 'text-foreground border-border hover:text-primary',
              ].join(' ')
            }
          >
            {item.name}
            <item.icon className="w-6 h-6" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <a
          href="https://www.documentacaoatlas.com.br"
          target="_blank"
          rel="noreferrer"
          className="p-2 bg-primary text-xs font-semibold text-primary-foreground gap-2 flex items-center justify-center"
        >
          {t('menu.help')}
          <CircleHelp />
        </a>
      </div>
    </aside>
  )
}
