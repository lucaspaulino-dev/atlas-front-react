import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Save } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useBrandingStore, DEFAULT_CONFIG } from './branding.store'
import type { BrandingConfig } from './branding.types'
import { useToast } from '@/shared/components/ui/toast/use-toast'

interface ColorFieldProps {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ label, hint, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5 flex-shrink-0"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#rrggbb"
          className="w-32 font-mono text-xs"
        />
        <div
          className="h-9 w-9 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: value }}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="bg-card border border-border rounded-lg p-6 space-y-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function BrandingConfigPage() {
  const { t } = useTranslation()
  const { config, setConfig, resetConfig } = useBrandingStore()
  const { toast } = useToast()

  const [draft, setDraft] = useState<BrandingConfig>(config)

  const update = (key: keyof BrandingConfig) => (value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const isDirty = JSON.stringify(draft) !== JSON.stringify(config)

  function handleSave() {
    setConfig(draft)
    toast({ title: t('branding.saved') })
  }

  function handleReset() {
    resetConfig()
    setDraft(DEFAULT_CONFIG)
    toast({ title: t('branding.resetDone') })
  }

  return (
    <div className="max-w-xl space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('branding.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('branding.description')}</p>
      </div>

      <Section title={t('branding.sectionBrand')}>
        <ColorField
          label={t('branding.primaryColor')}
          hint={t('branding.primaryColorHint')}
          value={draft.primaryColor}
          onChange={update('primaryColor')}
        />
      </Section>

      <Section title={t('branding.sectionSurface')}>
        <ColorField
          label={t('branding.backgroundColor')}
          hint={t('branding.backgroundColorHint')}
          value={draft.backgroundColor}
          onChange={update('backgroundColor')}
        />
        <ColorField
          label={t('branding.cardColor')}
          hint={t('branding.cardColorHint')}
          value={draft.cardColor}
          onChange={update('cardColor')}
        />
        <ColorField
          label={t('branding.borderColor')}
          hint={t('branding.borderColorHint')}
          value={draft.borderColor}
          onChange={update('borderColor')}
        />
        <ColorField
          label={t('branding.secondaryColor')}
          hint={t('branding.secondaryColorHint')}
          value={draft.secondaryColor}
          onChange={update('secondaryColor')}
        />
      </Section>

      <Section title={t('branding.sectionText')}>
        <ColorField
          label={t('branding.foregroundColor')}
          hint={t('branding.foregroundColorHint')}
          value={draft.foregroundColor}
          onChange={update('foregroundColor')}
        />
        <ColorField
          label={t('branding.mutedForegroundColor')}
          hint={t('branding.mutedForegroundColorHint')}
          value={draft.mutedForegroundColor}
          onChange={update('mutedForegroundColor')}
        />
      </Section>

      <Section title={t('branding.sectionSemantic')}>
        <ColorField
          label={t('branding.destructiveColor')}
          value={draft.destructiveColor}
          onChange={update('destructiveColor')}
        />
        <ColorField
          label={t('branding.successColor')}
          value={draft.successColor}
          onChange={update('successColor')}
        />
        <ColorField
          label={t('branding.warningColor')}
          value={draft.warningColor}
          onChange={update('warningColor')}
        />
        <ColorField
          label={t('branding.infoColor')}
          value={draft.infoColor}
          onChange={update('infoColor')}
        />
      </Section>

      <div className="flex items-center gap-3 pb-4">
        <Button onClick={handleSave} disabled={!isDirty}>
          <Save className="w-4 h-4 mr-2" />
          {t('branding.save')}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('branding.reset')}
        </Button>
      </div>
    </div>
  )
}
