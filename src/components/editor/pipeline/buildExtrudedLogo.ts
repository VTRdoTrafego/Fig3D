import * as THREE from 'three'
import type { LogoSettings } from '../../../types/domain'

function computeBounds(shapes: THREE.Shape[]) {
  const points = shapes.flatMap((shape) => shape.getPoints(24))
  const box = new THREE.Box2()
  points.forEach((point) => box.expandByPoint(point))
  return box
}

export function buildExtrudedLogoGeometry({
  shapes,
  settings,
  targetRadius,
}: {
  shapes: THREE.Shape[]
  settings: LogoSettings
  targetRadius: number
}) {
  if (!shapes.length) return null

  const bounds = computeBounds(shapes)
  const width = Math.max(1e-5, bounds.max.x - bounds.min.x)
  const height = Math.max(1e-5, bounds.max.y - bounds.min.y)
  const maxSide = Math.max(width, height)
  // Bevel expande a silhueta além do box 2D usado no fit — reserva leve para cantos nas formas agudas.
  const bevelThicknessApprox = Math.max(0.003, settings.bevelSize * 0.8)
  const bevelReserve = Math.min(0.07, settings.bevelSize * 0.12 + bevelThicknessApprox * 0.08)
  const safeRadius = targetRadius * (1 - settings.safeMargin) * (1 - bevelReserve)
  const fitScale = (safeRadius * 2) / maxSide
  const scaleFactor = fitScale

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: Math.max(0.035, settings.depth),
    bevelEnabled: true,
    bevelSize: Math.max(0.004, settings.bevelSize),
    bevelThickness: Math.max(0.003, settings.bevelSize * 0.8),
    bevelSegments: Math.max(1, Math.floor(settings.bevelSegments)),
    curveSegments: Math.round(12 + settings.smoothness * 20),
  })

  const centerX = (bounds.min.x + bounds.max.x) / 2
  const centerY = (bounds.min.y + bounds.max.y) / 2
  const matScale = new THREE.Matrix4()
    .makeScale(scaleFactor, scaleFactor, 1)
    .multiply(new THREE.Matrix4().makeTranslation(-centerX, -centerY, 0))

  geometry.applyMatrix4(matScale)
  geometry.computeBoundingBox()
  const geometryBounds = geometry.boundingBox
  if (geometryBounds) {
    const geometryCenter = new THREE.Vector3()
    geometryBounds.getCenter(geometryCenter)
    geometry.translate(-geometryCenter.x, -geometryCenter.y, -geometryCenter.z)
  }

  geometry.computeBoundingBox()
  const uvBounds = geometry.boundingBox
  if (uvBounds) {
    const sizeX = Math.max(1e-6, uvBounds.max.x - uvBounds.min.x)
    const sizeY = Math.max(1e-6, uvBounds.max.y - uvBounds.min.y)
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute
    const uv = geometry.getAttribute('uv') as THREE.BufferAttribute | undefined
    const nextUv = uv ?? new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2)
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      nextUv.setXY(i, (x - uvBounds.min.x) / sizeX, (y - uvBounds.min.y) / sizeY)
    }
    geometry.setAttribute('uv', nextUv)
    geometry.attributes.uv.needsUpdate = true
  }

  geometry.computeVertexNormals()
  return geometry
}
