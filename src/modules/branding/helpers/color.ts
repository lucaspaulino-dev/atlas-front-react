export function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      default:
        h = ((r - g) / d + 4) / 6
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function darkenHsl(hsl: string, amount: number): string {
  const parts = hsl.split(' ')
  const lightness = parseFloat(parts[2])
  return `${parts[0]} ${parts[1]} ${Math.max(0, lightness - amount)}%`
}

// Returns a near-black or white HSL string depending on whether the background is light or dark
export function contrastForeground(backgroundHsl: string): string {
  const parts = backgroundHsl.split(' ')
  const lightness = parseFloat(parts[2])
  return lightness > 55 ? '24 9.8% 10%' : '0 0% 100%'
}
