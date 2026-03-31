import { create } from 'zustand'
import type { EditorConfig } from '../types/domain'

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export const defaultConfig: EditorConfig = {
  modelType: 'circle-rgb-neon',
  logo: {
    path: '/favicon.svg',
    scale: 1,
    x: 0,
    y: 0,
    rotationZ: 0,
    opacity: 0.88,
    fitMode: 'contain',
    safeMargin: 0.06,
    mode: 'badge-hybrid',
    depth: 0.17,
    bevelSize: 0.016,
    bevelSegments: 3,
    smoothness: 0.7,
    color: '#dff4ff',
    materialType: 'glossy',
    colorMode: 'brand-original',
  },
  model: {
    radius: 1.34,
    thickness: 0.24,
    bevel: 0.12,
    depth: 0.24,
    tiltX: 0,
    tiltZ: 0,
    badgeCrossSection: 'circle',
  },
  face: {
    color: '#97c7ef',
    materialType: 'glossy',
    shine: 1,
  },
  border: {
    enabled: true,
    width: 0.086,
    color: '#cfeaff',
    opacity: 0.46,
    metalness: 0.08,
    roughness: 0.03,
    emissive: true,
  },
  lighting: {
    keyIntensity: 1.5,
    fillIntensity: 0.86,
    rimIntensity: 1.28,
    color: '#e2f4ff',
  },
  animation: {
    autoRotate: true,
    speed: 0.28,
    direction: 'clockwise',
    turns: 1,
  },
  scene: {
    backgroundColor: '#020913',
    transparentPreview: false,
    reflectionIntensity: 1.6,
    visualPreset: 'glass',
    rgbMode: 'border-circular',
    rgbSpeed: 0.62,
    rgbIntensity: 0.65,
  },
  export: {
    fps: 16,
    durationMs: 2200,
    resolutionScale: 1,
    transparent: true,
  },
}

export const stylePresets: Record<string, DeepPartial<EditorConfig>> = {
  PremiumRed: {
    face: { ...defaultConfig.face, color: '#dc2626', materialType: 'glossy', shine: 0.82 },
    logo: {
      ...defaultConfig.logo,
      color: '#fefefe',
      materialType: 'metallic',
      mode: 'badge-hybrid',
      colorMode: 'brand-3d-premium',
    },
    border: { ...defaultConfig.border, color: '#fef2f2', metalness: 0.8, roughness: 0.22 },
    scene: { ...defaultConfig.scene, visualPreset: 'premium', backgroundColor: '#111827' },
  },
  MetallicBlue: {
    logo: {
      ...defaultConfig.logo,
      color: '#dbeafe',
      materialType: 'metallic',
      mode: 'embossed',
      colorMode: 'brand-3d-premium',
    },
    face: { ...defaultConfig.face, color: '#1d4ed8', materialType: 'metallic', shine: 0.95 },
    border: { ...defaultConfig.border, color: '#bfdbfe', metalness: 0.95, roughness: 0.12 },
    lighting: { ...defaultConfig.lighting, keyIntensity: 1.35 },
    scene: { ...defaultConfig.scene, visualPreset: 'chrome', backgroundColor: '#030712' },
  },
  MatteBlack: {
    logo: {
      ...defaultConfig.logo,
      color: '#f3f4f6',
      materialType: 'matte',
      mode: 'engraved',
      colorMode: 'brand-original',
    },
    face: { ...defaultConfig.face, color: '#111827', materialType: 'matte', shine: 0.34 },
    border: { ...defaultConfig.border, color: '#4b5563', metalness: 0.32, roughness: 0.7 },
    lighting: { ...defaultConfig.lighting, keyIntensity: 0.95 },
    scene: { ...defaultConfig.scene, visualPreset: 'clean', backgroundColor: '#0b1120' },
  },
  RGBPulse: {
    logo: {
      ...defaultConfig.logo,
      materialType: 'glossy',
      mode: 'embossed',
      colorMode: 'brand-original',
      depth: 0.24,
      bevelSize: 0.026,
      bevelSegments: 4,
    },
    face: { ...defaultConfig.face, color: '#05080f', materialType: 'glossy', shine: 0.88 },
    border: { ...defaultConfig.border, color: '#d9ecff', metalness: 0.96, roughness: 0.14, width: 0.092 },
    lighting: { ...defaultConfig.lighting, keyIntensity: 1.4, fillIntensity: 0.62, rimIntensity: 0.95, color: '#d8e8ff' },
    scene: {
      ...defaultConfig.scene,
      visualPreset: 'neon',
      backgroundColor: '#040816',
      reflectionIntensity: 1.2,
      rgbMode: 'led-argb',
      rgbSpeed: 1.2,
      rgbIntensity: 1.15,
    },
  },
  PremiumOnyx: {
    logo: {
      ...defaultConfig.logo,
      materialType: 'metallic',
      mode: 'badge-hybrid',
      colorMode: 'brand-original',
      depth: 0.2,
      bevelSize: 0.022,
      bevelSegments: 3,
    },
    face: { ...defaultConfig.face, color: '#02050a', materialType: 'glossy', shine: 0.94 },
    border: { ...defaultConfig.border, color: '#e7edf8', metalness: 1, roughness: 0.12, width: 0.086 },
    lighting: { ...defaultConfig.lighting, keyIntensity: 1.22, fillIntensity: 0.44, rimIntensity: 0.72, color: '#eef5ff' },
    scene: { ...defaultConfig.scene, visualPreset: 'premium', backgroundColor: '#030712', reflectionIntensity: 1.25 },
  },
  ChromedEdge: {
    logo: {
      ...defaultConfig.logo,
      materialType: 'metallic',
      mode: 'embossed',
      colorMode: 'brand-original',
      depth: 0.22,
      bevelSize: 0.024,
      bevelSegments: 4,
    },
    face: { ...defaultConfig.face, color: '#05070c', materialType: 'metallic', shine: 0.98 },
    border: { ...defaultConfig.border, color: '#f5f9ff', metalness: 1, roughness: 0.08, width: 0.094 },
    lighting: { ...defaultConfig.lighting, keyIntensity: 1.36, fillIntensity: 0.5, rimIntensity: 0.82, color: '#f0f6ff' },
    scene: { ...defaultConfig.scene, visualPreset: 'chrome', backgroundColor: '#02050c', reflectionIntensity: 1.32 },
  },
  VidroTransparente: {
    logo: {
      ...defaultConfig.logo,
      materialType: 'glossy',
      mode: 'badge-hybrid',
      colorMode: 'brand-original',
      color: '#dff4ff',
      opacity: 0.88,
      depth: 0.17,
      bevelSize: 0.016,
      bevelSegments: 3,
    },
    face: { ...defaultConfig.face, color: '#97c7ef', materialType: 'glossy', shine: 1 },
    border: {
      ...defaultConfig.border,
      enabled: true,
      width: 0.086,
      opacity: 0.46,
      color: '#cfeaff',
      metalness: 0.08,
      roughness: 0.03,
      emissive: true,
    },
    lighting: {
      ...defaultConfig.lighting,
      keyIntensity: 1.5,
      fillIntensity: 0.86,
      rimIntensity: 1.28,
      color: '#e2f4ff',
    },
    scene: {
      ...defaultConfig.scene,
      visualPreset: 'glass',
      backgroundColor: '#020913',
      reflectionIntensity: 1.6,
      rgbMode: 'border-circular',
      rgbSpeed: 0.62,
      rgbIntensity: 0.65,
    },
  },
  GoldenCrown: {
    logo: {
      ...defaultConfig.logo,
      materialType: 'metallic',
      mode: 'badge-hybrid',
      colorMode: 'brand-original',
      depth: 0.21,
      bevelSize: 0.023,
      bevelSegments: 4,
    },
    face: { ...defaultConfig.face, color: '#0a0602', materialType: 'glossy', shine: 0.9 },
    border: { ...defaultConfig.border, color: '#f7d37a', metalness: 0.98, roughness: 0.16, width: 0.096 },
    lighting: { ...defaultConfig.lighting, keyIntensity: 1.3, fillIntensity: 0.5, rimIntensity: 0.78, color: '#ffe2a8' },
    scene: { ...defaultConfig.scene, visualPreset: 'premium', backgroundColor: '#0a0604', reflectionIntensity: 1.24 },
  },
  SilverBlackGolden: {
    logo: {
      ...defaultConfig.logo,
      materialType: 'metallic',
      mode: 'embossed',
      colorMode: 'brand-original',
      depth: 0.23,
      bevelSize: 0.026,
      bevelSegments: 4,
    },
    face: { ...defaultConfig.face, color: '#04060a', materialType: 'glossy', shine: 0.93 },
    border: { ...defaultConfig.border, color: '#f1d47c', metalness: 0.92, roughness: 0.18, width: 0.1 },
    lighting: { ...defaultConfig.lighting, keyIntensity: 1.32, fillIntensity: 0.48, rimIntensity: 0.84, color: '#dbe8ff' },
    scene: { ...defaultConfig.scene, visualPreset: 'chrome', backgroundColor: '#020409', reflectionIntensity: 1.28 },
  },
}

interface EditorState {
  config: EditorConfig
  setConfig: (payload: DeepPartial<EditorConfig>) => void
  resetConfig: () => void
  applyPreset: (presetKey: string) => void
}

function normalizeLegacyConfig(input: DeepPartial<EditorConfig> & Record<string, unknown>): DeepPartial<EditorConfig> {
  if ('logoPath' in input) {
    return {
      modelType: (input.modelType as string | undefined) ?? defaultConfig.modelType,
      logo: {
        ...defaultConfig.logo,
        path: (input.logoPath as string | null | undefined) ?? defaultConfig.logo.path,
        scale: (input.logoScale as number | undefined) ?? defaultConfig.logo.scale,
        x: (input.logoX as number | undefined) ?? defaultConfig.logo.x,
        y: (input.logoY as number | undefined) ?? defaultConfig.logo.y,
        rotationZ: (input.logoRotation as number | undefined) ?? defaultConfig.logo.rotationZ,
        opacity: (input.logoOpacity as number | undefined) ?? defaultConfig.logo.opacity,
      },
      model: {
        ...defaultConfig.model,
        depth: (input.depth as number | undefined) ?? defaultConfig.model.depth,
        thickness: (input.depth as number | undefined) ?? defaultConfig.model.thickness,
        tiltX: (input.tiltX as number | undefined) ?? defaultConfig.model.tiltX,
        tiltZ: (input.tiltZ as number | undefined) ?? defaultConfig.model.tiltZ,
      },
      face: {
        ...defaultConfig.face,
        color: (input.baseColor as string | undefined) ?? defaultConfig.face.color,
        materialType:
          (input.materialType as EditorConfig['face']['materialType'] | undefined) ??
          defaultConfig.face.materialType,
        shine: (input.shine as number | undefined) ?? defaultConfig.face.shine,
      },
      border: {
        ...defaultConfig.border,
        color: (input.borderColor as string | undefined) ?? defaultConfig.border.color,
        width: (input.borderWidth as number | undefined) ?? defaultConfig.border.width,
      },
      lighting: {
        ...defaultConfig.lighting,
        keyIntensity: (input.lightIntensity as number | undefined) ?? defaultConfig.lighting.keyIntensity,
        color: (input.lightColor as string | undefined) ?? defaultConfig.lighting.color,
      },
      animation: {
        ...defaultConfig.animation,
        autoRotate: !((input.isRotationPaused as boolean | undefined) ?? false),
        speed: (input.rotationSpeed as number | undefined) ?? defaultConfig.animation.speed,
      },
      scene: {
        ...defaultConfig.scene,
        backgroundColor: (input.backgroundColor as string | undefined) ?? defaultConfig.scene.backgroundColor,
      },
    }
  }
  return input
}

function mergeConfig(base: EditorConfig, patch: DeepPartial<EditorConfig>) {
  const normalized = normalizeLegacyConfig(patch as DeepPartial<EditorConfig> & Record<string, unknown>)
  const model = { ...base.model, ...normalized.model }
  if ((model.badgeCrossSection as string) === 'hexagon-nested') {
    model.badgeCrossSection = 'hexagon'
  }
  return {
    ...base,
    ...normalized,
    logo: { ...base.logo, ...normalized.logo },
    model,
    face: { ...base.face, ...normalized.face },
    border: { ...base.border, ...normalized.border },
    lighting: { ...base.lighting, ...normalized.lighting },
    animation: { ...base.animation, ...normalized.animation },
    scene: { ...base.scene, ...normalized.scene },
    export: { ...base.export, ...normalized.export },
  }
}

export const useEditorStore = create<EditorState>((set) => ({
  config: defaultConfig,
  setConfig: (payload) => set((state) => ({ config: mergeConfig(state.config, payload) })),
  resetConfig: () => set({ config: defaultConfig }),
  applyPreset: (presetKey) =>
    set((state) => {
      const preset = stylePresets[presetKey] ?? {}
      const preservedLogoPath = state.config.logo.path

      const merged = mergeConfig(state.config, preset)

      return {
        config: {
          ...merged,
          logo: {
            ...merged.logo,
            path: preservedLogoPath,
          },
        },
      }
    }),
}))

export function toVersionPayload(config: EditorConfig) {
  return {
    logo_path: config.logo.path,
    model_type: config.modelType,
    border_width: config.border.width,
    border_color: config.border.color,
    base_color: config.face.color,
    material_type: config.face.materialType,
    light_intensity: config.lighting.keyIntensity,
    light_color: config.lighting.color,
    rotation_speed: config.animation.speed,
    background_color: config.scene.backgroundColor,
    json_config: config,
  }
}
