import { Environment } from '@react-three/drei'
import type { EditorConfig } from '../../../types/domain'

export function SceneLights({
  config,
  suppressPreviewEffects = false,
}: {
  config: EditorConfig
  suppressPreviewEffects?: boolean
}) {
  const preset =
    config.scene.visualPreset === 'chrome'
      ? 'warehouse'
      : config.scene.visualPreset === 'neon'
        ? 'night'
        : config.scene.visualPreset === 'clean'
          ? 'city'
          : 'studio'

  return (
    <>
      <ambientLight intensity={Math.max(0.1, config.lighting.fillIntensity * 0.52)} color={config.lighting.color} />
      <hemisphereLight
        intensity={Math.max(0.08, config.lighting.fillIntensity * 0.42)}
        color="#e8f0ff"
        groundColor="#09111e"
      />
      <directionalLight
        position={[3.1, 2.8, 3.7]}
        intensity={config.lighting.keyIntensity * 1.08}
        color={config.lighting.color}
        castShadow
      />
      <pointLight
        position={[-2.9, 1.9, 2.7]}
        intensity={Math.max(0.08, config.lighting.fillIntensity * 0.85)}
        color="#ffffff"
      />
      <pointLight
        position={[0.1, 1.25, -4.8]}
        intensity={suppressPreviewEffects ? Math.max(0.06, config.lighting.rimIntensity * 0.55) : Math.max(0.12, config.lighting.rimIntensity * 1.2)}
        color={suppressPreviewEffects ? '#ffffff' : '#63f4c6'}
      />
      <pointLight
        position={[0, -1.3, 2.8]}
        intensity={Math.max(0.06, config.lighting.fillIntensity * 0.35)}
        color="#9fb4d5"
      />
      <Environment preset={preset} />
    </>
  )
}
