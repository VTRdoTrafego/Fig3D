import { useEffect } from 'react'
import { bootstrapPublicBranding, resolveBrandingLogoUrl, useBrandingStore } from '../../store/brandingStore'

function upsertHeadLink(rel: string, href: string, type?: string) {
  const selector = `link[rel="${rel}"]`
  let link = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    document.head.appendChild(link)
  }
  if (type) {
    link.setAttribute('type', type)
  }
  link.setAttribute('href', href)
}

export function BrandingRuntime() {
  const config = useBrandingStore((state) => state.config)
  const faviconUrl = resolveBrandingLogoUrl(config, 'favicon')

  useEffect(() => {
    void bootstrapPublicBranding()
  }, [])

  useEffect(() => {
    const lower = faviconUrl.trim().toLowerCase()
    const iconType = lower.endsWith('.svg') || lower.includes('.svg?') ? 'image/svg+xml' : 'image/png'
    upsertHeadLink('icon', faviconUrl, iconType)
    upsertHeadLink('apple-touch-icon', faviconUrl)
  }, [faviconUrl])

  useEffect(() => {
    const appName = config.appName?.trim() || 'FIG3D'
    const currentTitle = document.title || ''
    if (!currentTitle || currentTitle === 'FIG3D' || currentTitle.startsWith('Fig3D |') || currentTitle.startsWith('FIG3D |')) {
      document.title = `${appName} | Transformar logo em GIF 3D em segundos`
    }
  }, [config.appName])

  return null
}
