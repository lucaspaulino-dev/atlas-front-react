import { create } from 'zustand'
import type { BrandingConfig } from './branding.types'
import { hexToHsl, darkenHsl, contrastForeground } from './helpers/color'

const STORAGE_KEY = 'app-branding'

// Hex values that match index.css defaults (light theme)
export const DEFAULT_CONFIG: BrandingConfig = {
  primaryColor: '#f97316',
  backgroundColor: '#fafaf8',
  cardColor: '#ffffff',
  borderColor: '#e8e2de',
  foregroundColor: '#1c1917',
  mutedForegroundColor: '#a09890',
  secondaryColor: '#e8e2de',
  destructiveColor: '#e03535',
  successColor: '#0d9f6e',
  warningColor: '#d97706',
  infoColor: '#0891b2',
}

const CSS_PROPS = [
  '--primary',
  '--primary-hover',
  '--primary-foreground',
  '--ring',
  '--background',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--foreground',
  '--muted-foreground',
  '--border',
  '--input',
  '--secondary',
  '--secondary-foreground',
  '--secondary-hover',
  '--muted',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--destructive-light',
  '--success',
  '--success-foreground',
  '--success-light',
  '--warning',
  '--warning-foreground',
  '--warning-light',
  '--info',
  '--info-foreground',
  '--info-light',
]

function applyBranding(config: BrandingConfig): void {
  const el = document.documentElement

  const set = (prop: string, hsl: string) => el.style.setProperty(prop, hsl)

  const applyHex = (hex: string, cb: (hsl: string) => void) => {
    const hsl = hexToHsl(hex)
    if (hsl) cb(hsl)
  }

  applyHex(config.primaryColor, (hsl) => {
    set('--primary', hsl)
    set('--primary-hover', darkenHsl(hsl, 13))
    set('--primary-foreground', contrastForeground(hsl))
    set('--ring', hsl)
  })

  applyHex(config.backgroundColor, (hsl) => {
    set('--background', hsl)
  })

  applyHex(config.cardColor, (hsl) => {
    set('--card', hsl)
    set('--card-foreground', contrastForeground(hsl))
    set('--popover', hsl)
    set('--popover-foreground', contrastForeground(hsl))
  })

  applyHex(config.foregroundColor, (hsl) => {
    set('--foreground', hsl)
  })

  applyHex(config.mutedForegroundColor, (hsl) => {
    set('--muted-foreground', hsl)
  })

  applyHex(config.borderColor, (hsl) => {
    set('--border', hsl)
    set('--input', hsl)
  })

  applyHex(config.secondaryColor, (hsl) => {
    set('--secondary', hsl)
    set('--secondary-foreground', contrastForeground(hsl))
    set('--secondary-hover', darkenHsl(hsl, 7))
    set('--muted', hsl)
    set('--accent', hsl)
    set('--accent-foreground', contrastForeground(hsl))
  })

  const applySemanticColor = (hex: string, prop: string) => {
    applyHex(hex, (hsl) => {
      set(prop, hsl)
      set(`${prop}-foreground`, '0 0% 100%')
      // Light variant: same hue/sat, very high lightness
      const [h, s] = hsl.split(' ')
      set(`${prop}-light`, `${h} ${s} 96%`)
    })
  }

  applySemanticColor(config.destructiveColor, '--destructive')
  applySemanticColor(config.successColor, '--success')
  applySemanticColor(config.warningColor, '--warning')
  applySemanticColor(config.infoColor, '--info')
}

function removeBranding(): void {
  for (const prop of CSS_PROPS) {
    document.documentElement.style.removeProperty(prop)
  }
}

function loadSavedConfig(): BrandingConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return null
  }
}

const savedConfig = loadSavedConfig()
if (savedConfig) applyBranding(savedConfig)

interface BrandingStore {
  config: BrandingConfig
  setConfig: (config: BrandingConfig) => void
  resetConfig: () => void
}

export const useBrandingStore = create<BrandingStore>((set) => ({
  config: savedConfig ?? DEFAULT_CONFIG,
  setConfig: (config) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    applyBranding(config)
    set({ config })
  },
  resetConfig: () => {
    localStorage.removeItem(STORAGE_KEY)
    removeBranding()
    set({ config: DEFAULT_CONFIG })
  },
}))
