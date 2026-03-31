import { cn } from '../../lib/utils'
import { resolveBrandingLogoUrl, useBrandingStore, type BrandingLogoContext } from '../../store/brandingStore'

interface Fig3DBrandMarkProps {
  className?: string
  subtitle?: string
  compact?: boolean
  logoContext?: BrandingLogoContext
}

export function Fig3DBrandMark({
  className,
  subtitle,
  compact = false,
  logoContext = 'header',
}: Fig3DBrandMarkProps) {
  const brandingConfig = useBrandingStore((state) => state.config)
  const logoUrl = resolveBrandingLogoUrl(brandingConfig, logoContext)
  const brandName = brandingConfig.appName || 'FIG3D'
  const effectiveSubtitle = subtitle ?? brandingConfig.appTagline ?? 'Sua logo em 3D em segundos'

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <img
        src={logoUrl}
        alt={`Logo do ${brandName}`}
        className={cn(
          'shrink-0 rounded-xl object-cover',
          compact ? 'h-8 w-8' : 'h-10 w-10',
        )}
        loading="eager"
        decoding="async"
      />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-2)]">
          {brandName}
        </p>
        <p
          className={cn(
            'mt-1 text-sm font-semibold tracking-tight text-[var(--text-primary)]',
            compact ? 'truncate text-xs font-medium text-[var(--text-secondary)]' : '',
          )}
        >
          {effectiveSubtitle}
        </p>
      </div>
    </div>
  )
}
