import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { EditorConfig } from '../../../types/domain'

interface Props {
  config: EditorConfig
  logoTexture: THREE.Texture | null
}

function getMaterialProps(config: EditorConfig) {
  const shineFactor = Math.max(0.1, config.face.shine)
  if (config.face.materialType === 'metallic') {
    return {
      metalness: Math.min(1, 0.5 + shineFactor * 0.5),
      roughness: Math.max(0.08, 0.8 - shineFactor),
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
    }
  }
  if (config.face.materialType === 'matte') {
    return {
      metalness: 0.1,
      roughness: Math.max(0.35, 1 - shineFactor * 0.6),
      clearcoat: 0.1,
      clearcoatRoughness: 0.8,
    }
  }
  return {
    metalness: 0.42,
    roughness: Math.max(0.15, 0.9 - shineFactor * 0.8),
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  }
}

export function CircleBadge3D({ config, logoTexture }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const preset = useMemo(
    () => ({
      radius: config.model.radius,
      depth: config.model.depth,
      borderRadius: config.model.bevel,
      isFlat: config.modelType.includes('flat'),
      hasLed: config.modelType.includes('led'),
      isChunky: config.modelType.includes('coin') || config.modelType.includes('forma'),
    }),
    [config.model.bevel, config.model.depth, config.model.radius, config.modelType],
  )

  useFrame((_, delta) => {
    if (!groupRef.current || !config.animation.autoRotate) return
    groupRef.current.rotation.y += delta * config.animation.speed
  })

  const materialProps = useMemo(() => getMaterialProps(config), [config])
  const radius = preset.radius
  const depth = preset.isFlat ? Math.max(0.08, preset.depth * 0.5) : preset.depth
  const frontFaceRadius = radius * 0.94
  const topY = depth / 2

  return (
    <group ref={groupRef} rotation={[(config.model.tiltX * Math.PI) / 180, 0, (config.model.tiltZ * Math.PI) / 180]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, depth, 128, 1, false]} />
        <meshPhysicalMaterial color={config.face.color} {...materialProps} />
      </mesh>

      <mesh position={[0, topY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[frontFaceRadius, 128]} />
        <meshPhysicalMaterial color={config.face.color} {...materialProps} />
      </mesh>

      {config.border.enabled ? (
        <mesh position={[0, topY + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[frontFaceRadius - config.border.width, frontFaceRadius, 128]} />
          <meshPhysicalMaterial
            color={config.border.color}
            opacity={config.border.opacity}
            transparent={config.border.opacity < 0.99}
            metalness={config.border.metalness}
            roughness={config.border.roughness}
            emissive={config.border.emissive ? config.border.color : '#000000'}
            emissiveIntensity={config.border.emissive ? 0.25 : 0}
          />
        </mesh>
      ) : null}

      {logoTexture ? (
        <mesh position={[0, topY + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[frontFaceRadius - config.border.width * 1.1, 128]} />
          <meshBasicMaterial
            map={logoTexture}
            transparent
            opacity={config.logo.opacity}
            alphaTest={0.03}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ) : null}

      {preset.hasLed ? (
        <mesh position={[0, topY + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[frontFaceRadius * 0.84, frontFaceRadius * 0.9, 128]} />
          <meshStandardMaterial
            emissive={new THREE.Color(config.lighting.color)}
            emissiveIntensity={Math.max(0.12, config.lighting.keyIntensity * 0.42)}
            color={config.lighting.color}
            transparent
            opacity={0.7}
          />
        </mesh>
      ) : null}

      {preset.isChunky ? (
        <mesh position={[0, -depth * 0.18, 0]}>
          <cylinderGeometry args={[radius * 0.82, radius * 0.82, depth * 0.45, 96]} />
          <meshPhysicalMaterial color={config.border.color} {...materialProps} />
        </mesh>
      ) : null}
    </group>
  )
}
