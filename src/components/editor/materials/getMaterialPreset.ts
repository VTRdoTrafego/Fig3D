import type { MaterialType } from '../../../types/domain'

export function getMaterialPreset(type: MaterialType, shine: number) {
  const s = Math.max(0.1, shine)
  if (type === 'metallic') {
    return {
      metalness: Math.min(1, 0.52 + s * 0.45),
      roughness: Math.max(0.06, 0.82 - s),
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    }
  }
  if (type === 'matte') {
    return {
      metalness: 0.08,
      roughness: Math.max(0.35, 1 - s * 0.65),
      clearcoat: 0.08,
      clearcoatRoughness: 0.86,
    }
  }
  return {
    metalness: 0.38,
    roughness: Math.max(0.14, 0.84 - s * 0.72),
    clearcoat: 0.95,
    clearcoatRoughness: 0.11,
  }
}
