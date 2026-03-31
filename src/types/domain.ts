export type MaterialType = 'matte' | 'metallic' | 'glossy'
export type LogoFitMode = 'contain' | 'cover' | 'stretch'
export type LogoRenderMode = 'embossed' | 'engraved' | 'badge-hybrid'
export type LogoColorMode = 'brand-original' | 'brand-3d-premium'
export type RgbMode = 'pulse' | 'fire' | 'rgb-l' | 'led-argb' | 'border-circular' | 'border-animated'

/** Seção do corpo do badge (prisma 3D), independente do preset LED/RGB/coin em modelType. */
export type BadgeCrossSection =
  | 'circle'
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'hexagon'
  | 'diamond'

export interface LogoSettings {
  path: string | null
  scale: number
  x: number
  y: number
  rotationZ: number
  opacity: number
  fitMode: LogoFitMode
  safeMargin: number
  mode: LogoRenderMode
  depth: number
  bevelSize: number
  bevelSegments: number
  smoothness: number
  color: string
  materialType: MaterialType
  colorMode: LogoColorMode
}

export interface ModelSettings {
  radius: number
  thickness: number
  bevel: number
  depth: number
  tiltX: number
  tiltZ: number
  /** Forma da base do badge visto de frente (prisma extruído). */
  badgeCrossSection: BadgeCrossSection
}

export interface FaceSettings {
  color: string
  materialType: MaterialType
  shine: number
}

export interface BorderSettings {
  enabled: boolean
  width: number
  color: string
  opacity: number
  metalness: number
  roughness: number
  emissive: boolean
}

export interface LightingSettings {
  keyIntensity: number
  fillIntensity: number
  rimIntensity: number
  color: string
}

export interface AnimationSettings {
  autoRotate: boolean
  speed: number
  direction: 'clockwise' | 'counterclockwise'
  turns: number
}

export interface SceneSettings {
  backgroundColor: string
  transparentPreview: boolean
  reflectionIntensity: number
  visualPreset: 'clean' | 'chrome' | 'neon' | 'premium' | 'glass'
  rgbMode: RgbMode
  rgbSpeed: number
  rgbIntensity: number
}

export interface ExportSettings {
  fps: number
  durationMs: number
  resolutionScale: number
  transparent: boolean
}

export interface EditorConfig {
  modelType: string
  logo: LogoSettings
  model: ModelSettings
  face: FaceSettings
  border: BorderSettings
  lighting: LightingSettings
  animation: AnimationSettings
  scene: SceneSettings
  export: ExportSettings
}

export interface Project {
  id: string
  user_id: string
  name: string
  slug: string | null
  current_thumb_path: string | null
  created_at: string
  updated_at: string
}

export interface ProjectVersion {
  id: string
  project_id: string
  logo_path: string | null
  model_type: string
  border_width: number
  border_color: string
  base_color: string
  material_type: MaterialType
  light_intensity: number
  light_color: string
  rotation_speed: number
  background_color: string
  gif_path: string | null
  thumbnail_path: string | null
  json_config: EditorConfig
  created_at: string
}

export interface RenderExport {
  id: string
  project_id: string
  version_id: string | null
  gif_path: string
  thumbnail_path: string
  duration_ms: number
  fps: number
  background_color: string
  created_at: string
}
