export const themeTokens = {
  color: {
    bgMain: '#0B0B0F',
    bgSecondary: '#12131A',
    surface: '#171922',
    surfaceElevated: '#1D2030',
    textPrimary: '#FFFFFF',
    textSecondary: '#B8BDC9',
    textMuted: '#7F8796',
    accentYellow: '#F5C400',
    accentYellowHover: '#FFD84D',
    accentPurple: '#6D4BFF',
    accentPurpleGlow: '#8B5CFF',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    pill: 999,
  },
  shadow: {
    soft: '0 14px 42px rgba(0,0,0,0.45)',
    elevated: '0 18px 56px rgba(0,0,0,0.52)',
    glowPurple: '0 10px 30px rgba(109,75,255,0.34)',
    glowYellow: '0 12px 30px rgba(245,196,0,0.3)',
  },
  motion: {
    fast: 140,
    base: 220,
    slow: 320,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const

export type ThemeTokens = typeof themeTokens

type FlatTokenMap = Record<string, string>

function toKebabCase(input: string) {
  return input.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

function flattenTokens(source: Record<string, unknown>, prefix = ''): FlatTokenMap {
  return Object.entries(source).reduce<FlatTokenMap>((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}-${toKebabCase(key)}` : toKebabCase(key)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flattenTokens(value as Record<string, unknown>, nextKey))
      return acc
    }
    acc[nextKey] = String(value)
    return acc
  }, {})
}

export function getThemeCssVars() {
  return flattenTokens(themeTokens)
}

export function applyThemeTokens(target: HTMLElement) {
  const tokenVars = getThemeCssVars()
  Object.entries(tokenVars).forEach(([key, value]) => {
    target.style.setProperty(`--theme-${key}`, value)
  })
}
