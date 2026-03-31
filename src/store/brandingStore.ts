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

export interface SanitizeBrandingOptions {
  /**
   * Ao carregar JSON publico (VPS): remove data:/blob: e, em producao, URLs localhost —
   * visitantes nunca veem assets que existem so no seu navegador.
   */
  strictRemoteUrls?: boolean
}

function normalizeBrandUrl(value: unknown, strictRemote: boolean): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const t = value.trim()
  if (t.startsWith('blob:')) return null
  if (strictRemote) {
    if (t.startsWith('data:')) return null
    if (import.meta.env.PROD && /^https?:\/\/(localhost|127\.0\.0\.1)\b/i.test(t)) return null
  }
  return t
}

function sanitizeDemoAssets(input: unknown, strictRemote = false) {
  if (!Array.isArray(input)) return defaultBrandingConfig.marketingDemoAssets
  const normalized = input
    .filter((asset): asset is Partial<BrandingDemoAsset> => Boolean(asset && typeof asset === 'object'))
    .map((asset) => ({
      id: typeof asset.id === 'string' && asset.id ? asset.id : randomId(),
      name: typeof asset.name === 'string' && asset.name.trim() ? asset.name.trim() : 'Demo',
      url: normalizeBrandUrl(asset.url, strictRemote) ?? BRANDING_FALLBACK_LOGO,
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

export function sanitizeBrandingConfig(
  input: Partial<AppBrandingConfig> | null | undefined,
  options?: SanitizeBrandingOptions,
): AppBrandingConfig {
  const strict = options?.strictRemoteUrls === true
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
      normalizeBrandUrl(merged.primaryLogoUrl, strict) ?? defaultBrandingConfig.primaryLogoUrl,
    faviconUrl: normalizeBrandUrl(merged.faviconUrl, strict) ?? defaultBrandingConfig.faviconUrl,
    splashLogoUrl: normalizeBrandUrl(merged.splashLogoUrl, strict) ?? defaultBrandingConfig.splashLogoUrl,
    headerLogoUrl: normalizeBrandUrl(merged.headerLogoUrl, strict) ?? defaultBrandingConfig.headerLogoUrl,
    demoModel1Url: normalizeBrandUrl(merged.demoModel1Url, strict),
    demoModel2Url: normalizeBrandUrl(merged.demoModel2Url, strict),
    demoModel3Url: normalizeBrandUrl(merged.demoModel3Url, strict),
    demoModel4Url: normalizeBrandUrl(merged.demoModel4Url, strict),
    marketingDemoAssets: sanitizeDemoAssets(merged.marketingDemoAssets, strict),
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

/**
 * Visitantes na VPS nao tem localStorage do admin: carrega `branding.public.json` na mesma origem
 * (ou URL em VITE_PUBLIC_BRANDING_URL). Nao persiste em localStorage para atualizar a cada visita.
 */
export async function bootstrapPublicBranding(): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(BRANDING_STORAGE_KEY)) return

    const envUrl =
      typeof import.meta.env.VITE_PUBLIC_BRANDING_URL === 'string' ? import.meta.env.VITE_PUBLIC_BRANDING_URL.trim() : ''

    let fetchUrl: string
    if (envUrl && /^https?:\/\//i.test(envUrl)) {
      fetchUrl = envUrl
    } else {
      const root = new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
      const path = envUrl && !/^https?:\/\//i.test(envUrl) ? envUrl.replace(/^\//, '') : 'branding.public.json'
      fetchUrl = new URL(path, root).href
    }

    const res = await fetch(fetchUrl, { cache: 'no-store', credentials: 'omit' })
    if (!res.ok) return
    const data = (await res.json()) as Partial<AppBrandingConfig>
    const next = withUpdatedAt(sanitizeBrandingConfig(data, { strictRemoteUrls: true }))
    useBrandingStore.setState({ config: next })
  } catch {
    /* URL invalida, rede, 404, JSON invalido: mantem branding atual */
  }
}
