import {
  Download,
  ImagePlus,
  PlayCircle,
  PauseCircle,
  Sparkles,
  BadgeCheck,
  PlusSquare,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { BadgeCrossSection } from '../../types/domain'
import { badgeGeometryIcon, badgeGeometryLabel } from '../../constants/badgeGeometryCycle'
import { cn } from '../../lib/utils'

interface Props {
  isPlaying: boolean
  onImport: () => void
  onNew: () => void
  onToggleBorder: () => void
  onSetCircle: () => void
  onSetLogoMode: () => void
  onSpecial: () => void
  onTogglePlay: () => void
  onExport: () => void
  activeActionId?: string
  activeActionIds?: string[]
  /** Seção da base 3D (ciclo de formas): define rótulo e ícone do botão correspondente. */
  badgeCrossSection?: BadgeCrossSection
  /** Nome curto do formato da nova criação (ex.: FORMA), exibido sob "Novo". */
  newFormatName?: string
  /** Preset de borda atual (ciclo), exibido sob "Bordas". */
  borderPresetName?: string
}

interface Action {
  id: string
  label: string
  icon: ComponentType<{ size?: number }>
  onClick: () => void
  primary?: boolean
}

export function BottomActionBar({
  isPlaying,
  onImport,
  onNew,
  onToggleBorder,
  onSetCircle,
  onSetLogoMode,
  onSpecial,
  onTogglePlay,
  onExport,
  activeActionId,
  activeActionIds = [],
  badgeCrossSection = 'circle',
  newFormatName,
  borderPresetName,
}: Props) {
  const shapeLabel = badgeGeometryLabel(badgeCrossSection)
  const ShapeIcon = badgeGeometryIcon(badgeCrossSection)

  const actions: Action[] = [
    { id: 'import', label: 'Importar', icon: ImagePlus, onClick: onImport },
    { id: 'new', label: 'Novo', icon: PlusSquare, onClick: onNew },
    { id: 'border', label: 'Bordas', icon: BadgeCheck, onClick: onToggleBorder },
    { id: 'circle', label: shapeLabel, icon: ShapeIcon, onClick: onSetCircle },
    { id: 'logo', label: 'Logo', icon: BadgeCheck, onClick: onSetLogoMode },
    { id: 'special', label: 'Especial', icon: Sparkles, onClick: onSpecial },
    {
      id: 'play',
      label: isPlaying ? 'Pause' : 'Play',
      icon: isPlaying ? PauseCircle : PlayCircle,
      onClick: onTogglePlay,
    },
    { id: 'export', label: 'Exportar', icon: Download, onClick: onExport, primary: true },
  ]

  return (
    <div className="mt-3 rounded-3xl border border-[var(--border-soft)] bg-[rgba(20,22,31,0.72)] p-2.5 shadow-[var(--shadow-soft)] backdrop-blur-xl">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {actions.map((action) => {
          const Icon = action.icon
          const isActive = action.id === activeActionId || activeActionIds.includes(action.id)
          return (
            <button
              key={action.id}
              type="button"
              title={
                action.id === 'new' && newFormatName
                  ? `Próximo: ciclo de formatos · Atual: ${newFormatName}`
                  : action.id === 'border' && borderPresetName
                    ? `Próximo: ciclo de bordas · Atual: ${borderPresetName}`
                    : action.id === 'circle'
                      ? `Próximo: ciclo de formas da base · Atual: ${shapeLabel}`
                      : undefined
              }
              onClick={action.onClick}
              className={cn(
                'group inline-flex h-10 min-w-[66px] shrink-0 flex-col items-center justify-center rounded-2xl border px-2 transition sm:h-11 sm:min-w-[74px]',
                action.id === 'new' && newFormatName
                  ? 'sm:min-w-[80px]'
                  : action.id === 'border' && borderPresetName
                    ? 'sm:min-w-[80px]'
                    : action.id === 'circle'
                      ? 'sm:min-w-[80px]'
                      : '',
                action.primary
                  ? 'border-[rgba(245,196,0,0.35)] bg-[var(--accent-yellow)] text-zinc-950 hover:bg-[var(--accent-yellow-hover)]'
                  : isActive
                    ? 'border-[rgba(139,92,255,0.5)] bg-[rgba(139,92,255,0.2)] text-violet-100 shadow-[0_8px_22px_rgba(109,75,255,0.25)]'
                    : 'border-[var(--border-soft)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]',
              )}
            >
              <Icon size={13} />
              {action.id === 'new' && newFormatName ? (
                <span className="mt-0.5 flex max-w-[76px] flex-col items-center gap-0.5 sm:mt-1">
                  <span className="text-[9px] font-medium tracking-wide">{action.label}</span>
                  <span className="line-clamp-2 text-center text-[7.5px] font-semibold leading-tight text-violet-200 sm:text-[8px]">
                    {newFormatName}
                  </span>
                </span>
              ) : action.id === 'border' && borderPresetName ? (
                <span className="mt-0.5 flex max-w-[76px] flex-col items-center gap-0.5 sm:mt-1">
                  <span className="text-[9px] font-medium tracking-wide">{action.label}</span>
                  <span className="line-clamp-2 text-center text-[7.5px] font-semibold leading-tight text-violet-200 sm:text-[8px]">
                    {borderPresetName}
                  </span>
                </span>
              ) : action.id === 'circle' ? (
                <span className="mt-0.5 line-clamp-2 max-w-[76px] text-center text-[8px] font-semibold leading-tight text-violet-200 sm:mt-1 sm:text-[8.5px]">
                  {action.label}
                </span>
              ) : (
                <span className="mt-0.5 text-[9px] font-medium tracking-wide sm:mt-1 sm:text-[9px]">{action.label}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
