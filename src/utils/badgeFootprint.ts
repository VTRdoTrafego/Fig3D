import * as THREE from 'three'
import type { BadgeCrossSection } from '../types/domain'

function addRegularPolygonToShape(shape: THREE.Shape, sides: number, r: number, startAngle: number) {
  for (let i = 0; i <= sides; i++) {
    const a = startAngle + (i / sides) * Math.PI * 2
    const x = r * Math.cos(a)
    const y = r * Math.sin(a)
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
}

/**
 * Contorno 2D da face frontal do badge (XY), usado em ShapeGeometry / extrusão.
 * `circle` retorna um polígono de muitos lados como fallback; use CircleGeometry no render.
 */
export function createBadgeFootprintShape(kind: BadgeCrossSection, radius: number): THREE.Shape {
  const shape = new THREE.Shape()

  switch (kind) {
    case 'circle': {
      addRegularPolygonToShape(shape, 96, radius, -Math.PI / 2)
      break
    }
    case 'triangle': {
      addRegularPolygonToShape(shape, 3, radius, -Math.PI / 2)
      break
    }
    case 'square': {
      addRegularPolygonToShape(shape, 4, radius, Math.PI / 4)
      break
    }
    case 'diamond': {
      addRegularPolygonToShape(shape, 4, radius, -Math.PI / 2)
      break
    }
    case 'hexagon': {
      addRegularPolygonToShape(shape, 6, radius, -Math.PI / 2)
      break
    }
    case 'rectangle': {
      const hw = radius * 0.92
      const hh = radius * 0.58
      shape.moveTo(-hw, -hh)
      shape.lineTo(hw, -hh)
      shape.lineTo(hw, hh)
      shape.lineTo(-hw, hh)
      shape.closePath()
      break
    }
    default: {
      addRegularPolygonToShape(shape, 96, radius, -Math.PI / 2)
    }
  }

  return shape
}

/**
 * Escala para o raio-alvo da logo: círculo inscrito na forma / referência do modelo.
 * Garante que a marca caiba dentro da face sem estourar cantos.
 */
export function logoInscribedScaleInBadge(section: BadgeCrossSection): number {
  const margin = 0.94
  switch (section) {
    case 'circle':
      return 0.97 * margin
    case 'triangle':
      return 0.5 * margin
    case 'square':
    case 'diamond':
      return (Math.SQRT2 / 2) * margin
    case 'hexagon':
      return (Math.sqrt(3) / 2) * margin
    case 'rectangle': {
      const hw = 0.92
      const hh = 0.58
      const halfDiag = Math.hypot(hw, hh) / 2
      return (Math.min(hw, hh) / halfDiag) * margin
    }
    default:
      return 0.95 * margin
  }
}

function traceClosedOutline(
  target: THREE.Shape | THREE.Path,
  section: BadgeCrossSection,
  r: number,
  reverse: boolean,
) {
  const push = (x: number, y: number, i: number) => {
    if (i === 0) target.moveTo(x, y)
    else target.lineTo(x, y)
  }

  if (section === 'rectangle') {
    const hw = r * 0.92
    const hh = r * 0.58
    const pts: [number, number][] = [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh],
    ]
    const ordered = reverse ? [...pts].reverse() : pts
    ordered.forEach((p, i) => push(p[0], p[1], i))
    return
  }

  if (section === 'circle') {
    const n = 72
    const indices = reverse ? Array.from({ length: n + 1 }, (_, i) => n - i) : [...Array(n + 1).keys()]
    indices.forEach((i, idx) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      push(r * Math.cos(a), r * Math.sin(a), idx)
    })
    return
  }

  let sides = 6
  let start = -Math.PI / 2
  if (section === 'triangle') sides = 3
  else if (section === 'square') {
    sides = 4
    start = Math.PI / 4
  } else if (section === 'diamond') {
    sides = 4
    start = -Math.PI / 2
  } else if (section === 'hexagon') {
    sides = 6
    start = -Math.PI / 2
  }

  const count = sides + 1
  const idxs = reverse ? Array.from({ length: count }, (_, i) => sides - i) : [...Array(count).keys()]
  idxs.forEach((i, k) => {
    const a = start + (i / sides) * Math.PI * 2
    push(r * Math.cos(a), r * Math.sin(a), k)
  })
}

/** Anel planar (outer − inner) na face do badge, alinhado à forma. */
export function createBadgeRingShape(
  section: BadgeCrossSection,
  rOuter: number,
  rInner: number,
): THREE.Shape {
  const shape = new THREE.Shape()
  traceClosedOutline(shape, section, rOuter, false)
  const hole = new THREE.Path()
  traceClosedOutline(hole, section, rInner, true)
  shape.holes.push(hole)
  return shape
}

export function badgePrismCylinderSegments(kind: BadgeCrossSection): number | null {
  switch (kind) {
    case 'triangle':
      return 3
    case 'square':
    case 'diamond':
      return 4
    case 'hexagon':
      return 6
    default:
      return null
  }
}

/**
 * Rotação Y do prisma no mesh (euler [PI/2, valor, 0]).
 * Quadrado: PI/4 alinha o cilindro de 4 faces ao contorno com vértices em PI/4.
 * Hexágono: 0 — com rotation.x=PI/2, o cilindro de 6 lados já coincide com
 * `createBadgeFootprintShape` (start -PI/2); PI/6 extra deslocava a base em relação aos anéis 2D.
 */
export function badgePrismZRotation(kind: BadgeCrossSection): number {
  switch (kind) {
    case 'square':
      return Math.PI / 4
    case 'hexagon':
      return 0
    default:
      return 0
  }
}

/**
 * Rotação Z de overlays na face (anéis LED/RGB, borda, accent, prato híbrido).
 * Quadrado: prisma usa PI/4 em Y; shapes 2D já no eixo certo — não reaplicar em Z (viraria losango).
 */
export function badgeFaceDecorZRotation(kind: BadgeCrossSection): number {
  if (kind === 'square') return 0
  return badgePrismZRotation(kind)
}

export function buildRectangleBoxGeometry(radius: number, depth: number) {
  const w = radius * 1.84
  const h = radius * 1.16
  const geo = new THREE.BoxGeometry(w, depth, h)
  return geo
}
