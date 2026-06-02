import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useDashboardStats } from './hooks/useDashboardStats'

interface StatCardProps {
  label: string
  value: ReactNode
  isMock?: boolean
}

function StatCard({ label, value, isMock }: StatCardProps) {
  const { t } = useTranslation()

  return (
    <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">
        {label}
        {isMock && (
          <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full ml-2">
            {t('common.dashboard.comingSoon')}
          </span>
        )}
      </h3>
      <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { totalIndications, recentIndications, isLoading, error } = useDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('common.dashboard.title')}
        </h2>
        <p className="text-muted-foreground mt-2">{t('common.dashboard.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t('common.dashboard.totalIndications')}
          value={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : totalIndications}
          isMock={false}
        />
        <StatCard label={t('common.dashboard.companies')} value={48} isMock />
        <StatCard label={t('common.dashboard.segmentation')} value={12} isMock />
        <StatCard label={t('common.dashboard.tourism')} value={7} isMock />
      </div>

      <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t('common.dashboard.recentIndications')}
        </h3>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : recentIndications.length === 0 && !isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.dashboard.noData')}</p>
        ) : (
          <ul>
            {recentIndications.map((name) => (
              <li
                key={name}
                className="text-sm text-foreground py-2 border-b border-border last:border-0"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
