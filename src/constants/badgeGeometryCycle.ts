import type { ComponentType } from 'react'
import { Circle, Diamond, Hexagon, RectangleHorizontal, Square, Triangle } from 'lucide-react'
import type { BadgeCrossSection } from '../types/domain'

/** Ordem do ciclo no botão da forma da base (geometria 3D). */
export const BADGE_GEOMETRY_CYCLE: { id: BadgeCrossSection; label: string }[] = [
  { id: 'circle', label: 'Círculo' },
  { id: 'triangle', label: 'Triângulo' },
  { id: 'square', label: 'Quadrado' },
  { id: 'rectangle', label: 'Retângulo' },
  { id: 'hexagon', label: 'Hexágono' },
  { id: 'diamond', label: 'Losango' },
]

export function badgeGeometryLabel(section: BadgeCrossSection) {
  return BADGE_GEOMETRY_CYCLE.find((s) => s.id === section)?.label ?? section
}

/** Ícone Lucide alinhado à seção atual (barra inferior / dock mobile). */
export function badgeGeometryIcon(section: BadgeCrossSection): ComponentType<{ size?: number }> {
  switch (section) {
    case 'circle':
      return Circle
    case 'triangle':
      return Triangle
    case 'square':
      return Square
    case 'rectangle':
      return RectangleHorizontal
    case 'hexagon':
      return Hexagon
    case 'diamond':
      return Diamond
    default:
      return Circle
  }
}

export function isPolygonalBadgeSection(section: BadgeCrossSection) {
  return section !== 'circle'
}
