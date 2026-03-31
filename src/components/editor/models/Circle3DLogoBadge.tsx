import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { EditorConfig } from '../../../types/domain'
import {
  badgeFaceDecorZRotation,
  badgePrismCylinderSegments,
  badgePrismZRotation,
  buildRectangleBoxGeometry,
  createBadgeFootprintShape,
  createBadgeRingShape,
} from '../../../utils/badgeFootprint'

interface Props {
  config: EditorConfig
  logoGeometry: THREE.ExtrudeGeometry | null
  logoTexture: THREE.Texture | null
  forcedRotationOffsetY?: number | null
  suppressPreviewEffects?: boolean
}

function createOnyxMicroPatternTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#3a4454'
  ctx.fillRect(0, 0, size, size)
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 36; i += 1) {
    const y = (i / 36) * size
    ctx.strokeStyle = i % 2 === 0 ? '#738196' : '#4d596b'
    ctx.lineWidth = i % 6 === 0 ? 1.4 : 0.8
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y + ((i % 3) - 1) * 2.5)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.35
  for (let i = 0; i < 22; i += 1) {
    const x = (i / 22) * size
    ctx.strokeStyle = '#8c99ad'
    ctx.lineWidth = i % 7 === 0 ? 1.1 : 0.6
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + ((i % 2) * 2 - 1) * 5, size)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 4)
  texture.needsUpdate = true
  return texture
}

function samplePaletteColor(palette: readonly string[], phase: number) {
  const wrapped = ((phase % 1) + 1) % 1
  const scaled = wrapped * palette.length
  const fromIndex = Math.floor(scaled) % palette.length
  const toIndex = (fromIndex + 1) % palette.length
  const mix = scaled - Math.floor(scaled)
  return new THREE.Color(palette[fromIndex]).lerp(new THREE.Color(palette[toIndex]), mix)
}

export function Circle3DLogoBadge({
  config,
  logoGeometry,
  logoTexture,
  forcedRotationOffsetY = null,
  suppressPreviewEffects = false,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const forcedRotationBaseYRef = useRef(0)
  const usingForcedRotationRef = useRef(false)
  const rgbOuterRingRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const rgbInnerRingRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const rgbOuterBackRingRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const rgbInnerBackRingRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const rgbLightARef = useRef<THREE.PointLight | null>(null)
  const rgbLightBRef = useRef<THREE.PointLight | null>(null)
  const rgbBackLightARef = useRef<THREE.PointLight | null>(null)
  const rgbBackLightBRef = useRef<THREE.PointLight | null>(null)
  const isLogoOnlyMode = config.modelType.includes('forma')
  const isFlatProfile = config.modelType.includes('flat')
  const isChunkyProfile = config.modelType.includes('chunky') || config.modelType.includes('thick')
  const isCoinProfile = config.modelType.includes('coin')
  const isRgbProfile = config.modelType.includes('rgb')
  const isGoldenProfile = config.modelType.includes('golden')
  const rgbMode = config.scene.rgbMode
  const rgbSpeed = Math.max(0.2, config.scene.rgbSpeed)
  const rgbIntensity = Math.max(0.2, config.scene.rgbIntensity)
  const badgeSection = config.model.badgeCrossSection ?? 'circle'
  const useCircularRings = badgeSection === 'circle'
  const shouldRenderAccentOverlays = !suppressPreviewEffects
  const shouldRenderRgbEffects = isRgbProfile && !suppressPreviewEffects
  const shouldRenderLedEffects = config.modelType.includes('led') && !suppressPreviewEffects

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (forcedRotationOffsetY !== null) {
        if (!usingForcedRotationRef.current) {
          forcedRotationBaseYRef.current = groupRef.current.rotation.y
          usingForcedRotationRef.current = true
        }
        groupRef.current.rotation.y = forcedRotationBaseYRef.current + forcedRotationOffsetY
      } else {
        usingForcedRotationRef.current = false
        if (config.animation.autoRotate) {
          const direction = config.animation.direction === 'counterclockwise' ? -1 : 1
          groupRef.current.rotation.y += delta * config.animation.speed * direction
        }
      }
    }

    if (!shouldRenderRgbEffects) return
    const t = state.clock.elapsedTime * rgbSpeed
    let pulseA = 0.5 + Math.sin(t * 5.4) * 0.5
    let pulseB = 0.5 + Math.sin(t * 6.2 + Math.PI * 0.4) * 0.5
    let colorA = new THREE.Color('#ff355e')
    let colorB = new THREE.Color('#3dff6f')
    const rgbRichPalette = ['#ff355e', '#ff7a18', '#ffd000', '#76ff03', '#00e5ff', '#3d7bff', '#b82fff']
    const argbRichPalette = ['#ff1744', '#ff9100', '#ffd600', '#00e676', '#00e5ff', '#2979ff', '#7c4dff', '#f500ff']

    if (rgbMode === 'fire') {
      const fireMixA = 0.5 + Math.sin(t * 8.2) * 0.5
      const fireMixB = 0.5 + Math.sin(t * 10.1 + 0.8) * 0.5
      colorA = new THREE.Color().setHSL(0.02 + fireMixA * 0.08, 0.95, 0.52)
      colorB = new THREE.Color().setHSL(0.08 + fireMixB * 0.06, 0.98, 0.5)
      pulseA = 0.35 + fireMixA * 0.95
      pulseB = 0.3 + fireMixB * 0.9
    } else if (rgbMode === 'rgb-l') {
      const phase = t * 0.1
      colorA = samplePaletteColor(rgbRichPalette, phase)
      colorB = samplePaletteColor(rgbRichPalette, phase + 0.34)
      pulseA = 0.52 + Math.sin(t * 3.8) * 0.48
      pulseB = 0.52 + Math.sin(t * 3.8 + Math.PI / 2) * 0.48
    } else if (rgbMode === 'led-argb') {
      // ARGB with richer multi-color transitions (not just blink alternation).
      const phase = t * 0.22
      colorA = samplePaletteColor(argbRichPalette, phase)
      colorB = samplePaletteColor(argbRichPalette, phase + 0.26)
      pulseA = 0.55 + Math.sin(t * 7.6) * 0.45
      pulseB = 0.55 + Math.sin(t * 7.6 + Math.PI / 1.7) * 0.45
    } else if (rgbMode === 'border-circular') {
      const hue = (t * 0.18) % 1
      colorA = new THREE.Color().setHSL(hue, 0.95, 0.57)
      colorB = new THREE.Color().setHSL((hue + 0.33) % 1, 0.95, 0.57)
      pulseA = 0.45 + Math.sin(t * 5.3) * 0.35
      pulseB = 0.45 + Math.sin(t * 5.3 + Math.PI) * 0.35
    } else if (rgbMode === 'border-animated') {
      const chase = 0.5 + Math.sin(t * 11.5) * 0.5
      colorA = new THREE.Color().setHSL((t * 0.24) % 1, 0.95, 0.58)
      colorB = new THREE.Color().setHSL((t * 0.24 + 0.5) % 1, 0.95, 0.58)
      pulseA = 0.25 + chase * 1.05
      pulseB = 0.25 + (1 - chase) * 1.05
    } else {
      const phase = t * 0.12
      colorA = samplePaletteColor(rgbRichPalette, phase)
      colorB = samplePaletteColor(rgbRichPalette, phase + 0.5)
      pulseA = 0.48 + Math.sin(t * 4.4) * 0.42
      pulseB = 0.48 + Math.sin(t * 4.4 + Math.PI / 1.6) * 0.42
    }

    const applyRgbRing = (
      material: THREE.MeshStandardMaterial | null,
      color: THREE.Color,
      pulse: number,
      baseOpacity: number,
    ) => {
      if (!material) return
      material.emissive.copy(color)
      material.color.copy(color).multiplyScalar(0.25)
      material.emissiveIntensity = (0.34 + pulse * 0.9) * rgbIntensity
      material.opacity = baseOpacity + pulse * 0.24
    }

    applyRgbRing(rgbOuterRingRef.current, colorA, pulseA, 0.52)
    applyRgbRing(rgbInnerRingRef.current, colorB, pulseB, 0.46)
    applyRgbRing(rgbOuterBackRingRef.current, colorA, pulseA, 0.48)
    applyRgbRing(rgbInnerBackRingRef.current, colorB, pulseB, 0.42)

    if (rgbLightARef.current) {
      rgbLightARef.current.color.copy(colorA)
      rgbLightARef.current.intensity = (0.2 + pulseA * 0.55) * rgbIntensity
    }
    if (rgbLightBRef.current) {
      rgbLightBRef.current.color.copy(colorB)
      rgbLightBRef.current.intensity = (0.18 + pulseB * 0.52) * rgbIntensity
    }
    if (rgbBackLightARef.current) {
      rgbBackLightARef.current.color.copy(colorA)
      rgbBackLightARef.current.intensity = (0.16 + pulseA * 0.44) * rgbIntensity
    }
    if (rgbBackLightBRef.current) {
      rgbBackLightBRef.current.color.copy(colorB)
      rgbBackLightBRef.current.intensity = (0.14 + pulseB * 0.4) * rgbIntensity
    }
  })

  const baseRadius = config.model.radius
  const baseDepth = config.model.depth
  const radius = isFlatProfile ? baseRadius * 0.97 : isChunkyProfile ? baseRadius * 1.02 : baseRadius
  const depth = isFlatProfile ? baseDepth * 0.74 : isChunkyProfile ? baseDepth * 1.28 : isCoinProfile ? baseDepth * 1.08 : baseDepth
  const frontFaceRadius = radius * (isCoinProfile ? 0.915 : 0.94)
  const topZ = depth / 2
  const logoMode = config.logo.mode
  const logoDepthBoost = isCoinProfile ? 1.08 : 1
  const logoZ =
    isLogoOnlyMode
      ? depth * 0.5 + config.logo.depth * logoDepthBoost * 0.5 + 0.001
      : logoMode === 'engraved'
      ? topZ - config.logo.depth * logoDepthBoost + 0.008
      : topZ + (logoMode === 'badge-hybrid' ? 0.032 : 0.014)
  const backLogoZ = -logoZ
  const logoGroupX = config.logo.x * radius * 0.75
  const logoGroupY = config.logo.y * radius * 0.75
  const logoGroupScale = Math.max(0.1, config.logo.scale)
  const isChromePreset = config.scene.visualPreset === 'chrome'
  const isGlassPreset = config.scene.visualPreset === 'glass'
  const chromeMaterial = isGlassPreset
    ? {
        color: '#e3f5ff',
        metalness: 0.02,
        roughness: 0.03,
        clearcoat: 1,
        clearcoatRoughness: 0.01,
        envMapIntensity: 1.75,
        transmission: 0.97,
        ior: 1.42,
        thickness: 0.95,
        transparent: true,
        opacity: 0.56,
      }
    : {
        color: isGoldenProfile ? '#f8d385' : isChromePreset ? '#eef3ff' : '#dbe2ec',
        metalness: 1,
        roughness: isGoldenProfile ? 0.18 : isChromePreset ? 0.12 : 0.17,
        clearcoat: 1,
        clearcoatRoughness: isGoldenProfile ? 0.09 : isChromePreset ? 0.04 : 0.07,
        envMapIntensity: 1.28,
      }
  const darkFaceMaterial = isGlassPreset
    ? {
        color: '#bfe5ff',
        metalness: 0.03,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.62,
        transmission: 0.95,
        ior: 1.38,
        thickness: 0.72,
        transparent: true,
        opacity: 0.42,
      }
    : {
        color: '#03060a',
        metalness: 0.88,
        roughness: 0.28,
        clearcoat: 0.9,
        clearcoatRoughness: 0.14,
        envMapIntensity: 1.08,
      }
  const onyxMicroPattern = useMemo(() => createOnyxMicroPatternTexture(), [])

  const prismSegments = badgePrismCylinderSegments(badgeSection)
  const prismZRot = badgePrismZRotation(badgeSection)
  const faceDecorZRot = badgeFaceDecorZRotation(badgeSection)
  const rgbPtFrontA = [0, 0.22, topZ + 0.35] as const
  const rgbPtFrontB = [0, -0.24, topZ + 0.3] as const
  const rgbPtBackA = [0, 0.2, -topZ - 0.34] as const
  const rgbPtBackB = [0, -0.22, -topZ - 0.3] as const

  const rectangleBoxGeometry = useMemo(() => {
    if (badgeSection !== 'rectangle') return null
    return buildRectangleBoxGeometry(frontFaceRadius, depth)
  }, [badgeSection, frontFaceRadius, depth])

  const hybridPlateGeometry = useMemo(() => {
    if (badgeSection === 'circle' || logoMode !== 'badge-hybrid') return null
    const innerR = Math.max(0.08, frontFaceRadius - config.border.width * 1.15)
    const shape = createBadgeFootprintShape(badgeSection, innerR)
    const geo = new THREE.ShapeGeometry(shape)
    geo.computeVertexNormals()
    return geo
  }, [badgeSection, frontFaceRadius, logoMode, config.border.width])

  const ringPlanar = badgeSection === 'circle' ? null : badgeSection
  const borderWidthScaled = config.border.width * (isCoinProfile ? 0.9 : 1)

  const rgbOuterShapeGeo = useMemo(() => {
    if (!ringPlanar) return null
    const shape = createBadgeRingShape(ringPlanar, frontFaceRadius * 0.845, frontFaceRadius * 0.79)
    const g = new THREE.ShapeGeometry(shape)
    g.computeVertexNormals()
    return g
  }, [ringPlanar, frontFaceRadius])

  const rgbInnerShapeGeo = useMemo(() => {
    if (!ringPlanar) return null
    const shape = createBadgeRingShape(ringPlanar, frontFaceRadius * 0.775, frontFaceRadius * 0.74)
    const g = new THREE.ShapeGeometry(shape)
    g.computeVertexNormals()
    return g
  }, [ringPlanar, frontFaceRadius])

  const ledRingShapeGeo = useMemo(() => {
    if (!ringPlanar) return null
    const shape = createBadgeRingShape(ringPlanar, frontFaceRadius * 0.9, frontFaceRadius * 0.83)
    const g = new THREE.ShapeGeometry(shape)
    g.computeVertexNormals()
    return g
  }, [ringPlanar, frontFaceRadius])

  const borderRingShapeGeo = useMemo(() => {
    if (!ringPlanar) return null
    const innerR = Math.max(0.02, frontFaceRadius - borderWidthScaled)
    const shape = createBadgeRingShape(ringPlanar, frontFaceRadius, innerR)
    const g = new THREE.ShapeGeometry(shape)
    g.computeVertexNormals()
    return g
  }, [ringPlanar, frontFaceRadius, borderWidthScaled])

  const accentRingShapeGeo = useMemo(() => {
    if (!ringPlanar) return null
    const shape = createBadgeRingShape(ringPlanar, frontFaceRadius * 0.935, frontFaceRadius * 0.88)
    const g = new THREE.ShapeGeometry(shape)
    g.computeVertexNormals()
    return g
  }, [ringPlanar, frontFaceRadius])

  useEffect(() => () => rectangleBoxGeometry?.dispose(), [rectangleBoxGeometry])
  useEffect(() => () => hybridPlateGeometry?.dispose(), [hybridPlateGeometry])
  useEffect(() => {
    return () => {
      rgbOuterShapeGeo?.dispose()
      rgbInnerShapeGeo?.dispose()
      ledRingShapeGeo?.dispose()
      borderRingShapeGeo?.dispose()
      accentRingShapeGeo?.dispose()
    }
  }, [rgbOuterShapeGeo, rgbInnerShapeGeo, ledRingShapeGeo, borderRingShapeGeo, accentRingShapeGeo])

  const materials = useMemo(() => {
    const sideMaterial = logoTexture
      ? new THREE.MeshPhysicalMaterial({
          // Keep extrusion faithful to brand while adding premium depth.
          color: '#ffffff',
          map: logoTexture,
          emissive: isRgbProfile ? '#74c8ff' : '#5eff8d',
          emissiveMap: logoTexture,
          emissiveIntensity: suppressPreviewEffects ? 0 : isRgbProfile ? 0.16 : 0.09,
          metalness: 0.32,
          roughness: 0.42,
          clearcoat: 0.46,
          clearcoatRoughness: 0.14,
          envMapIntensity: 1.18,
          anisotropy: 0.38,
          anisotropyRotation: 0.22,
          transparent: config.logo.opacity < 0.99,
          opacity: config.logo.opacity,
        })
      : new THREE.MeshPhysicalMaterial({
          color: config.logo.color,
          metalness: 0.22,
          roughness: 0.56,
          clearcoat: 0.34,
          clearcoatRoughness: 0.2,
          envMapIntensity: 1.05,
          anisotropy: 0.24,
          anisotropyRotation: 0.2,
          transparent: config.logo.opacity < 0.99,
          opacity: config.logo.opacity,
        })

    const hiddenFrontMaterial = new THREE.MeshPhysicalMaterial({
      color: '#cfd6e2',
      metalness: 0.82,
      roughness: 0.26,
      clearcoat: 0.72,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.08,
      transparent: false,
      opacity: 1,
      // Keep only the back cap from this pass to avoid coplanar front overlap.
      side: THREE.BackSide,
    })

    const hiddenSideMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })

    const texturedFrontMaterial = logoTexture
      ? new THREE.MeshBasicMaterial({
          map: logoTexture,
          transparent: true,
          // Cut very low-alpha pixels to keep silhouette stable at grazing angles.
          alphaTest: suppressPreviewEffects ? 0.045 : 0.03,
          opacity: config.logo.opacity,
          toneMapped: false,
          depthWrite: true,
          depthTest: true,
          side: THREE.FrontSide,
          polygonOffset: true,
          polygonOffsetFactor: -0.5,
          polygonOffsetUnits: -1,
        })
      : new THREE.MeshPhysicalMaterial({
          color: config.logo.color,
          metalness: 0.05,
          roughness: 0.9,
          clearcoat: 0.05,
          transparent: true,
          opacity: config.logo.opacity,
          depthWrite: false,
          depthTest: true,
          side: THREE.FrontSide,
        })

    return { sideMaterial, texturedFrontMaterial, hiddenFrontMaterial, hiddenSideMaterial }
  }, [config.logo.color, config.logo.opacity, isRgbProfile, logoTexture, suppressPreviewEffects])

  useEffect(() => {
    return () => {
      materials.sideMaterial.dispose()
      materials.texturedFrontMaterial.dispose()
      materials.hiddenFrontMaterial.dispose()
      materials.hiddenSideMaterial.dispose()
    }
  }, [materials])

  useEffect(() => () => onyxMicroPattern?.dispose(), [onyxMicroPattern])

  // FORMA mode: keep object upright and rotate horizontally on Y axis.
  const baseRotationX = 0
  const baseRotationY = 0
  const baseRotationZ = 0

  return (
    <group
      ref={groupRef}
      scale={1}
      rotation={[
        baseRotationX + (config.model.tiltX * Math.PI) / 180,
        baseRotationY,
        baseRotationZ + (config.model.tiltZ * Math.PI) / 180,
      ]}
    >
      {!isLogoOnlyMode ? (
        <>
          {badgeSection === 'rectangle' && rectangleBoxGeometry ? (
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
              <primitive object={rectangleBoxGeometry} attach="geometry" />
              <meshPhysicalMaterial {...chromeMaterial} />
            </mesh>
          ) : prismSegments !== null ? (
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, prismZRot, 0]}>
              <cylinderGeometry args={[radius, radius, depth, prismSegments, 1, false]} />
              <meshPhysicalMaterial attach="material-0" {...chromeMaterial} />
              <meshPhysicalMaterial
                attach="material-1"
                {...darkFaceMaterial}
                {...(isGlassPreset
                  ? {}
                  : {
                      bumpMap: onyxMicroPattern,
                      bumpScale: 0.009,
                      roughnessMap: onyxMicroPattern,
                    })}
              />
              <meshPhysicalMaterial
                attach="material-2"
                {...darkFaceMaterial}
                {...(isGlassPreset
                  ? {}
                  : {
                      bumpMap: onyxMicroPattern,
                      bumpScale: 0.008,
                      roughnessMap: onyxMicroPattern,
                    })}
              />
            </mesh>
          ) : (
            <>
              <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[radius, radius, depth, 128, 1, false]} />
                <meshPhysicalMaterial {...chromeMaterial} />
              </mesh>

              <mesh position={[0, 0, topZ - 0.007]}>
                <circleGeometry args={[frontFaceRadius, 128]} />
                <meshPhysicalMaterial
                  {...darkFaceMaterial}
                  {...(isGlassPreset
                    ? {}
                    : {
                        bumpMap: onyxMicroPattern,
                        bumpScale: 0.009,
                        roughnessMap: onyxMicroPattern,
                      })}
                />
              </mesh>
              {useCircularRings && shouldRenderAccentOverlays ? (
                <mesh position={[0, 0, topZ + 0.0046]}>
                  <ringGeometry args={[frontFaceRadius * 0.88, frontFaceRadius * 0.935, 128]} />
                  <meshPhysicalMaterial
                    color={isGlassPreset ? '#d6ecff' : '#b7c5da'}
                    metalness={isGlassPreset ? 0.08 : 1}
                    roughness={isGlassPreset ? 0.08 : 0.14}
                    clearcoat={1}
                    clearcoatRoughness={0.06}
                    transparent
                    opacity={isGlassPreset ? 0.24 : 0.24}
                  />
                </mesh>
              ) : null}
              <mesh position={[0, 0, -topZ - 0.002]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[frontFaceRadius, 128]} />
                <meshPhysicalMaterial
                  {...darkFaceMaterial}
                  {...(isGlassPreset
                    ? {}
                    : {
                        bumpMap: onyxMicroPattern,
                        bumpScale: 0.008,
                        roughnessMap: onyxMicroPattern,
                      })}
                />
              </mesh>

              {config.border.enabled && useCircularRings ? (
                <>
                  <mesh position={[0, 0, topZ + 0.004]}>
                    <ringGeometry
                      args={[
                        frontFaceRadius - config.border.width * (isCoinProfile ? 0.9 : 1),
                        frontFaceRadius,
                        128,
                      ]}
                    />
                    <meshPhysicalMaterial
                      color={chromeMaterial.color}
                      opacity={config.border.opacity}
                      transparent={config.border.opacity < 0.99}
                      metalness={chromeMaterial.metalness}
                      roughness={chromeMaterial.roughness}
                      clearcoat={chromeMaterial.clearcoat}
                      clearcoatRoughness={chromeMaterial.clearcoatRoughness}
                      emissive="#000000"
                      emissiveIntensity={0}
                    />
                  </mesh>
                  <mesh position={[0, 0, -topZ - 0.004]} rotation={[0, Math.PI, 0]}>
                    <ringGeometry
                      args={[
                        frontFaceRadius - config.border.width * (isCoinProfile ? 0.9 : 1),
                        frontFaceRadius,
                        128,
                      ]}
                    />
                    <meshPhysicalMaterial
                      color={chromeMaterial.color}
                      opacity={config.border.opacity}
                      transparent={config.border.opacity < 0.99}
                      metalness={chromeMaterial.metalness}
                      roughness={chromeMaterial.roughness}
                      clearcoat={chromeMaterial.clearcoat}
                      clearcoatRoughness={chromeMaterial.clearcoatRoughness}
                      emissive="#000000"
                      emissiveIntensity={0}
                    />
                  </mesh>
                </>
              ) : null}
            </>
          )}

          {!isLogoOnlyMode && !useCircularRings && shouldRenderAccentOverlays && accentRingShapeGeo ? (
            <mesh position={[0, 0, topZ + 0.0046]} rotation={[0, 0, faceDecorZRot]}>
              <primitive object={accentRingShapeGeo} attach="geometry" />
              <meshPhysicalMaterial
                color={isGlassPreset ? '#d6ecff' : '#b7c5da'}
                metalness={isGlassPreset ? 0.08 : 1}
                roughness={isGlassPreset ? 0.08 : 0.14}
                clearcoat={1}
                clearcoatRoughness={0.06}
                transparent
                opacity={isGlassPreset ? 0.24 : 0.24}
                side={THREE.DoubleSide}
              />
            </mesh>
          ) : null}

          {!isLogoOnlyMode && !useCircularRings && config.border.enabled && borderRingShapeGeo ? (
            <>
              <mesh position={[0, 0, topZ + 0.004]} rotation={[0, 0, faceDecorZRot]}>
                <primitive object={borderRingShapeGeo} attach="geometry" />
                <meshPhysicalMaterial
                  color={chromeMaterial.color}
                  opacity={config.border.opacity}
                  transparent={config.border.opacity < 0.99}
                  metalness={chromeMaterial.metalness}
                  roughness={chromeMaterial.roughness}
                  clearcoat={chromeMaterial.clearcoat}
                  clearcoatRoughness={chromeMaterial.clearcoatRoughness}
                  emissive="#000000"
                  emissiveIntensity={0}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <group position={[0, 0, -topZ - 0.004]} rotation={[0, Math.PI, 0]}>
                <mesh rotation={[0, 0, faceDecorZRot]}>
                  <primitive object={borderRingShapeGeo} attach="geometry" />
                  <meshPhysicalMaterial
                    color={chromeMaterial.color}
                    opacity={config.border.opacity}
                    transparent={config.border.opacity < 0.99}
                    metalness={chromeMaterial.metalness}
                    roughness={chromeMaterial.roughness}
                    clearcoat={chromeMaterial.clearcoat}
                    clearcoatRoughness={chromeMaterial.clearcoatRoughness}
                    emissive="#000000"
                    emissiveIntensity={0}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            </>
          ) : null}

          {shouldRenderRgbEffects ? (
            useCircularRings ? (
              <>
                <mesh position={[0, 0, topZ + 0.012]}>
                  <ringGeometry args={[frontFaceRadius * 0.79, frontFaceRadius * 0.845, 128]} />
                  <meshStandardMaterial
                    ref={rgbOuterRingRef}
                    emissive="#4de0ff"
                    emissiveIntensity={0.38}
                    color="#243447"
                    transparent
                    opacity={0.68}
                  />
                </mesh>
                <mesh position={[0, 0, topZ + 0.0135]}>
                  <ringGeometry args={[frontFaceRadius * 0.74, frontFaceRadius * 0.775, 128]} />
                  <meshStandardMaterial
                    ref={rgbInnerRingRef}
                    emissive="#75ff7c"
                    emissiveIntensity={0.34}
                    color="#1c3022"
                    transparent
                    opacity={0.62}
                  />
                </mesh>
                <pointLight ref={rgbLightARef} position={rgbPtFrontA} color="#4de0ff" intensity={0.42} distance={2.6} decay={2} />
                <pointLight ref={rgbLightBRef} position={rgbPtFrontB} color="#75ff7c" intensity={0.36} distance={2.2} decay={2} />

                <group position={[0, 0, -topZ - 0.012]} rotation={[0, Math.PI, 0]}>
                  <mesh>
                    <ringGeometry args={[frontFaceRadius * 0.79, frontFaceRadius * 0.845, 128]} />
                    <meshStandardMaterial
                      ref={rgbOuterBackRingRef}
                      emissive="#4de0ff"
                      emissiveIntensity={0.32}
                      color="#243447"
                      transparent
                      opacity={0.62}
                    />
                  </mesh>
                  <mesh position={[0, 0, -0.0014]}>
                    <ringGeometry args={[frontFaceRadius * 0.74, frontFaceRadius * 0.775, 128]} />
                    <meshStandardMaterial
                      ref={rgbInnerBackRingRef}
                      emissive="#75ff7c"
                      emissiveIntensity={0.3}
                      color="#1c3022"
                      transparent
                      opacity={0.56}
                    />
                  </mesh>
                </group>
                <pointLight
                  ref={rgbBackLightARef}
                  position={rgbPtBackA}
                  color="#4de0ff"
                  intensity={0.28}
                  distance={2.2}
                  decay={2}
                />
                <pointLight
                  ref={rgbBackLightBRef}
                  position={rgbPtBackB}
                  color="#75ff7c"
                  intensity={0.24}
                  distance={2}
                  decay={2}
                />
              </>
            ) : rgbOuterShapeGeo && rgbInnerShapeGeo ? (
              <>
                <mesh position={[0, 0, topZ + 0.012]} rotation={[0, 0, faceDecorZRot]}>
                  <primitive object={rgbOuterShapeGeo} attach="geometry" />
                  <meshStandardMaterial
                    ref={rgbOuterRingRef}
                    emissive="#4de0ff"
                    emissiveIntensity={0.38}
                    color="#243447"
                    transparent
                    opacity={0.68}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[0, 0, topZ + 0.0135]} rotation={[0, 0, faceDecorZRot]}>
                  <primitive object={rgbInnerShapeGeo} attach="geometry" />
                  <meshStandardMaterial
                    ref={rgbInnerRingRef}
                    emissive="#75ff7c"
                    emissiveIntensity={0.34}
                    color="#1c3022"
                    transparent
                    opacity={0.62}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <pointLight ref={rgbLightARef} position={rgbPtFrontA} color="#4de0ff" intensity={0.42} distance={2.6} decay={2} />
                <pointLight ref={rgbLightBRef} position={rgbPtFrontB} color="#75ff7c" intensity={0.36} distance={2.2} decay={2} />

                <group position={[0, 0, -topZ - 0.012]} rotation={[0, Math.PI, 0]}>
                  <mesh rotation={[0, 0, faceDecorZRot]}>
                    <primitive object={rgbOuterShapeGeo} attach="geometry" />
                    <meshStandardMaterial
                      ref={rgbOuterBackRingRef}
                      emissive="#4de0ff"
                      emissiveIntensity={0.32}
                      color="#243447"
                      transparent
                      opacity={0.62}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  <mesh position={[0, 0, -0.0014]} rotation={[0, 0, faceDecorZRot]}>
                    <primitive object={rgbInnerShapeGeo} attach="geometry" />
                    <meshStandardMaterial
                      ref={rgbInnerBackRingRef}
                      emissive="#75ff7c"
                      emissiveIntensity={0.3}
                      color="#1c3022"
                      transparent
                      opacity={0.56}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
                <pointLight
                  ref={rgbBackLightARef}
                  position={rgbPtBackA}
                  color="#4de0ff"
                  intensity={0.28}
                  distance={2.2}
                  decay={2}
                />
                <pointLight
                  ref={rgbBackLightBRef}
                  position={rgbPtBackB}
                  color="#75ff7c"
                  intensity={0.24}
                  distance={2}
                  decay={2}
                />
              </>
            ) : null
          ) : null}

          {logoMode === 'badge-hybrid' ? (
            badgeSection === 'circle' ? (
              <mesh position={[0, 0, topZ + 0.006]}>
                <circleGeometry args={[frontFaceRadius - config.border.width * 1.15, 128]} />
                <meshPhysicalMaterial {...darkFaceMaterial} />
              </mesh>
            ) : hybridPlateGeometry ? (
              <mesh position={[0, 0, topZ + 0.006]} rotation={[0, 0, faceDecorZRot]}>
                <primitive object={hybridPlateGeometry} attach="geometry" />
                <meshPhysicalMaterial {...darkFaceMaterial} />
              </mesh>
            ) : null
          ) : null}
        </>
      ) : null}

      {logoGeometry ? (
        <>
          <group position={[logoGroupX, logoGroupY, logoZ]} scale={[logoGroupScale, logoGroupScale, 1]}>
            <mesh geometry={logoGeometry} rotation={[0, 0, 0]} castShadow={false} receiveShadow={false}>
              <primitive object={materials.hiddenFrontMaterial} attach="material-0" />
              <primitive object={materials.sideMaterial} attach="material-1" />
            </mesh>
            <mesh
              geometry={logoGeometry}
              position={[0, 0, 0.0015]}
              rotation={[0, 0, 0]}
              castShadow={false}
              receiveShadow={false}
            >
              <primitive object={materials.texturedFrontMaterial} attach="material-0" />
              <primitive object={materials.hiddenSideMaterial} attach="material-1" />
            </mesh>
          </group>

          {!isLogoOnlyMode ? (
            <group
              position={[logoGroupX, logoGroupY, backLogoZ]}
              rotation={[0, Math.PI, 0]}
              scale={[logoGroupScale, logoGroupScale, 1]}
            >
              <mesh geometry={logoGeometry} rotation={[0, 0, 0]} castShadow={false} receiveShadow={false}>
                <primitive object={materials.hiddenFrontMaterial} attach="material-0" />
                <primitive object={materials.sideMaterial} attach="material-1" />
              </mesh>
              <mesh
                geometry={logoGeometry}
                position={[0, 0, 0.0015]}
                rotation={[0, 0, 0]}
                castShadow={false}
                receiveShadow={false}
              >
                <primitive object={materials.texturedFrontMaterial} attach="material-0" />
                <primitive object={materials.hiddenSideMaterial} attach="material-1" />
              </mesh>
            </group>
          ) : null}
        </>
      ) : null}

      {shouldRenderLedEffects && !isLogoOnlyMode ? (
        useCircularRings ? (
          <mesh position={[0, 0, topZ + 0.01]}>
            <ringGeometry args={[frontFaceRadius * 0.83, frontFaceRadius * 0.9, 128]} />
            <meshStandardMaterial
              emissive={new THREE.Color(config.lighting.color)}
              emissiveIntensity={Math.max(0.12, config.lighting.keyIntensity * 0.38)}
              color={config.lighting.color}
              transparent
              opacity={0.7}
            />
          </mesh>
        ) : ledRingShapeGeo ? (
          <mesh position={[0, 0, topZ + 0.01]} rotation={[0, 0, faceDecorZRot]}>
            <primitive object={ledRingShapeGeo} attach="geometry" />
            <meshStandardMaterial
              emissive={new THREE.Color(config.lighting.color)}
              emissiveIntensity={Math.max(0.12, config.lighting.keyIntensity * 0.38)}
              color={config.lighting.color}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        ) : null
      ) : null}
    </group>
  )
}
