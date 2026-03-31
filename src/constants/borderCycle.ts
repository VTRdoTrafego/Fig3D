import type { BorderSettings } from '../types/domain'

export interface BorderCycleStep {
  label: string
  patch: { border: Partial<BorderSettings> }
}

/** Mesma sequência do antigo painel: desligada → espessuras → dourada → neon → volta. */
export const BORDER_CYCLE_STEPS: BorderCycleStep[] = [
  { label: 'Desligada', patch: { border: { enabled: false } } },
  { label: 'Fina', patch: { border: { enabled: true, width: 0.04 } } },
  { label: 'Média', patch: { border: { enabled: true, width: 0.08 } } },
  { label: 'Forte', patch: { border: { enabled: true, width: 0.12 } } },
  {
    label: 'Dourada',
    patch: {
      border: {
        enabled: true,
        color: '#F5C400',
        emissive: false,
        width: 0.095,
        metalness: 0.92,
        roughness: 0.2,
      },
    },
  },
  {
    label: 'Neon',
    patch: {
      border: {
        enabled: true,
        color: '#8B5CFF',
        emissive: true,
        width: 0.095,
        metalness: 0.96,
        roughness: 0.14,
      },
    },
  },
]

function normHex(color: string) {
  return color.trim().toLowerCase().replace('#', '')
}

/** Índice do passo que melhor descreve a borda atual (para rótulo e próximo do ciclo). */
export function matchBorderCycleIndex(b: BorderSettings): number {
  if (!b.enabled) return 0
  const color = normHex(b.color || '')
  if (b.emissive && color === '8b5cff') return 5
  if (!b.emissive && color === 'f5c400' && Math.abs(b.width - 0.095) < 0.025) return 4
  if (Math.abs(b.width - 0.12) < 0.025) return 3
  if (Math.abs(b.width - 0.08) < 0.025) return 2
  if (Math.abs(b.width - 0.04) < 0.025) return 1
  return 2
}
