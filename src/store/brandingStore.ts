import { create } from 'zustand'

export type BrandingLogoContext = 'primary' | 'header' | 'public' | 'splash' | 'favicon'

export interface BrandingDemoAsset {
  id: string
  name: string
  url: string
  featured: boolean
  published: boolean
  createdAt: string
}

export interface AppBrandingConfig {
  appName: string
  appTagline: string
  shortDescription: string
  marketingDescription: string
  primaryLogoUrl: string | null
  faviconUrl: string | null
  splashLogoUrl: string | null
  headerLogoUrl: string | null
  /** GIF/imagem por slot nos 4 circulos da landing; vazio usa splash. */
  demoModel1Url: string | null
  demoModel2Url: string | null
  demoModel3Url: string | null
  demoModel4Url: string | null
  marketingDemoAssets: BrandingDemoAsset[]
  useLogoAsFavicon: boolean
  useLogoInSplash: boolean
  useLogoInHeader: boolean
  useLogoInPublicPages: boolean
  accentColor: string
  published: boolean
  updatedAt: string
}

interface BrandingState {
  config: AppBrandingConfig
  setConfigPatch: (patch: Partial<AppBrandingConfig>) => void
  replaceConfig: (next: AppBrandingConfig) => void
  resetConfig: () => void
  refreshFromStorage: () => void
}

const BRANDING_STORAGE_KEY = 'fig3d-branding-config-v1'
const BRANDING_FALLBACK_LOGO = '/fig3d-logo.png'

function nowIso() {
  return new Date().toISOString()
}

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const defaultDemoAsset: BrandingDemoAsset = {
  id: randomId(),
  name: 'Demo principal Fig3D',
  url: BRANDING_FALLBACK_LOGO,
  featured: true,
  published: true,
  createdAt: nowIso(),
}

export const defaultBrandingConfig: AppBrandingConfig = {
  appName: 'FIG3D',
  appTagline: 'Sua logo em 3D em segundos, sem precisar pagar pros outros.',
  shortDescription: 'Transforme sua logo em GIF 3D em segundos.',
  marketingDescription:
    'Com o Fig3D, voce cria logo animada com poucos cliques, visual profissional e autonomia total.',
  primaryLogoUrl: BRANDING_FALLBACK_LOGO,
  faviconUrl: BRANDING_FALLBACK_LOGO,
  splashLogoUrl: BRANDING_FALLBACK_LOGO,
  headerLogoUrl: BRANDING_FALLBACK_LOGO,
  demoModel1Url: null,
  demoModel2Url: null,
  demoModel3Url: null,
  demoModel4Url: null,
  marketingDemoAssets: [defaultDemoAsset],
  useLogoAsFavicon: true,
  useLogoInSplash: true,
  useLogoInHeader: true,
  useLogoInPublicPages: true,
  accentColor: '#F5C400',
  published: true,
  updatedAt: nowIso(),
}

function sanitizeDemoAssets(input: unknown) {
  if (!Array.isArray(input)) return defaultBrandingConfig.marketingDemoAssets
  const normalized = input
    .filter((asset): asset is Partial<BrandingDemoAsset> => Boolean(asset && typeof asset === 'object'))
    .map((asset) => ({
      id: typeof asset.id === 'string' && asset.id ? asset.id : randomId(),
      name: typeof asset.name === 'string' && asset.name.trim() ? asset.name.trim() : 'Demo',
      url: typeof asset.url === 'string' && asset.url ? asset.url : BRANDING_FALLBACK_LOGO,
      featured: Boolean(asset.featured),
      published: asset.published !== false,
      createdAt: typeof asset.createdAt === 'string' && asset.createdAt ? asset.createdAt : nowIso(),
    }))
  if (!normalized.length) return []
  if (!normalized.some((asset) => asset.featured)) {
    normalized[0] = { ...normalized[0], featured: true }
  }
  return normalized
}

function sanitizeBrandingConfig(input: Partial<AppBrandingConfig> | null | undefined): AppBrandingConfig {
  const merged = {
    ...defaultBrandingConfig,
    ...(input ?? {}),
  }
  return {
    appName: typeof merged.appName === 'string' && merged.appName.trim() ? merged.appName.trim() : defaultBrandingConfig.appName,
    appTagline:
      typeof merged.appTagline === 'string' && merged.appTagline.trim()
        ? merged.appTagline.trim()
        : defaultBrandingConfig.appTagline,
    shortDescription:
      typeof merged.shortDescription === 'string' && merged.shortDescription.trim()
        ? merged.shortDescription.trim()
        : defaultBrandingConfig.shortDescription,
    marketingDescription:
      typeof merged.marketingDescription === 'string' && merged.marketingDescription.trim()
        ? merged.marketingDescription.trim()
        : defaultBrandingConfig.marketingDescription,
    primaryLogoUrl:
      typeof merged.primaryLogoUrl === 'string' && merged.primaryLogoUrl ? merged.primaryLogoUrl : defaultBrandingConfig.primaryLogoUrl,
    faviconUrl: typeof merged.faviconUrl === 'string' && merged.faviconUrl ? merged.faviconUrl : defaultBrandingConfig.faviconUrl,
    splashLogoUrl:
      typeof merged.splashLogoUrl === 'string' && merged.splashLogoUrl ? merged.splashLogoUrl : defaultBrandingConfig.splashLogoUrl,
    headerLogoUrl:
      typeof merged.headerLogoUrl === 'string' && merged.headerLogoUrl ? merged.headerLogoUrl : defaultBrandingConfig.headerLogoUrl,
    demoModel1Url:
      typeof merged.demoModel1Url === 'string' && merged.demoModel1Url.trim() ? merged.demoModel1Url.trim() : null,
    demoModel2Url:
      typeof merged.demoModel2Url === 'string' && merged.demoModel2Url.trim() ? merged.demoModel2Url.trim() : null,
    demoModel3Url:
      typeof merged.demoModel3Url === 'string' && merged.demoModel3Url.trim() ? merged.demoModel3Url.trim() : null,
    demoModel4Url:
      typeof merged.demoModel4Url === 'string' && merged.demoModel4Url.trim() ? merged.demoModel4Url.trim() : null,
    marketingDemoAssets: sanitizeDemoAssets(merged.marketingDemoAssets),
    useLogoAsFavicon: Boolean(merged.useLogoAsFavicon),
    useLogoInSplash: Boolean(merged.useLogoInSplash),
    useLogoInHeader: Boolean(merged.useLogoInHeader),
    useLogoInPublicPages: Boolean(merged.useLogoInPublicPages),
    accentColor:
      typeof merged.accentColor === 'string' && merged.accentColor.trim() ? merged.accentColor.trim() : defaultBrandingConfig.accentColor,
    published: merged.published !== false,
    updatedAt: typeof merged.updatedAt === 'string' && merged.updatedAt ? merged.updatedAt : nowIso(),
  }
}

function readFromStorage() {
  if (typeof window === 'undefined') return defaultBrandingConfig
  const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY)
  if (!raw) return defaultBrandingConfig
  try {
    return sanitizeBrandingConfig(JSON.parse(raw) as Partial<AppBrandingConfig>)
  } catch {
    return defaultBrandingConfig
  }
}

function persistToStorage(config: AppBrandingConfig) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('fig3d-branding-updated', { detail: config }))
}

function withUpdatedAt(config: AppBrandingConfig) {
  return {
    ...config,
    updatedAt: nowIso(),
  }
}

export function resolveBrandingLogoUrl(config: AppBrandingConfig, context: BrandingLogoContext) {
  const fallback = BRANDING_FALLBACK_LOGO
  if (context === 'favicon') {
    if (config.useLogoAsFavicon) {
      return config.faviconUrl || config.primaryLogoUrl || fallback
    }
    return config.faviconUrl || fallback
  }
  if (context === 'header') {
    if (!config.useLogoInHeader) return fallback
    return config.headerLogoUrl || config.primaryLogoUrl || fallback
  }
  if (context === 'public') {
    if (!config.useLogoInPublicPages) return fallback
    return config.primaryLogoUrl || fallback
  }
  if (context === 'splash') {
    if (!config.useLogoInSplash) return config.primaryLogoUrl || fallback
    return config.splashLogoUrl || config.primaryLogoUrl || fallback
  }
  return config.primaryLogoUrl || fallback
}

export const useBrandingStore = create<BrandingState>((set) => ({
  config: readFromStorage(),
  setConfigPatch: (patch) =>
    set((state) => {
      const next = sanitizeBrandingConfig(
        withUpdatedAt({
          ...state.config,
          ...patch,
        }),
      )
      persistToStorage(next)
      return { config: next }
    }),
  replaceConfig: (next) =>
    set(() => {
      const sanitized = sanitizeBrandingConfig(withUpdatedAt(next))
      persistToStorage(sanitized)
      return { config: sanitized }
    }),
  resetConfig: () =>
    set(() => {
      const reset = sanitizeBrandingConfig(withUpdatedAt(defaultBrandingConfig))
      persistToStorage(reset)
      return { config: reset }
    }),
  refreshFromStorage: () =>
    set(() => ({
      config: readFromStorage(),
    })),
}))

export function getBrandingConfigSnapshot() {
  return useBrandingStore.getState().config
}
