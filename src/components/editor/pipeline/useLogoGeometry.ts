import { useEffect, useMemo, useState } from 'react'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import * as THREE from 'three'
import type { EditorConfig } from '../../../types/domain'
import { logoInscribedScaleInBadge } from '../../../utils/badgeFootprint'
import { traceAlphaToShapes } from './traceAlphaToSvg'
import { buildExtrudedLogoGeometry } from './buildExtrudedLogo'

interface Result {
  geometry: THREE.ExtrudeGeometry | null
  warning: string | null
}

function isSvgPath(path: string) {
  return /\.svg($|\?)/i.test(path) || path.includes('image/svg')
}

export function useLogoGeometry(config: EditorConfig): Result {
  const [shapes, setShapes] = useState<THREE.Shape[]>([])
  const [warning, setWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!config.logo.path) {
      Promise.resolve().then(() => {
        setShapes([])
        setWarning(null)
      })
      return
    }

    let cancelled = false
    const logoPath = config.logo.path

    async function run() {
      try {
        if (isSvgPath(logoPath)) {
          const svgText = await fetch(logoPath).then((res) => res.text())
          if (cancelled) return
          const data = new SVGLoader().parse(svgText)
          const nextShapes: THREE.Shape[] = []
          data.paths.forEach((path) => {
            nextShapes.push(...SVGLoader.createShapes(path))
          })
          setWarning(nextShapes.length ? null : 'SVG sem paths válidos.')
          setShapes(nextShapes)
          return
        }

        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = logoPath
        await image.decode()
        if (cancelled) return

        const naturalWidth = Math.max(1, image.naturalWidth || image.width || 1)
        const naturalHeight = Math.max(1, image.naturalHeight || image.height || 1)
        const maxSize = 768
        const scale = Math.min(1, maxSize / Math.max(naturalWidth, naturalHeight))
        const width = Math.max(64, Math.round(naturalWidth * scale))
        const height = Math.max(64, Math.round(naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setWarning('Falha ao processar imagem.')
          setShapes([])
          return
        }
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(image, 0, 0, width, height)
        const { data } = ctx.getImageData(0, 0, width, height)
        const traced = traceAlphaToShapes({ imageData: data, width, height, threshold: 0.32 })
        if (cancelled) return
        if (!traced.shapes.length) {
          setWarning('Não foi possível extrudar essa imagem. Use PNG/SVG com transparência clara.')
        } else if (traced.complexityScore > 3200) {
          setWarning('Logo complexa detectada: pode exigir simplificação para melhor performance.')
        } else {
          setWarning(null)
        }
        setShapes(traced.shapes)
      } catch {
        if (!cancelled) {
          setWarning('Falha ao converter logo para geometria 3D.')
          setShapes([])
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [config.logo.path])

  const geometry = useMemo(() => {
    const isFormaModel = config.modelType.includes('forma')
    const section = config.model.badgeCrossSection ?? 'circle'
    const inscribed = logoInscribedScaleInBadge(section)
    const layoutFactor = isFormaModel ? 1.08 : 0.78
    const targetRadius = config.model.radius * layoutFactor * inscribed

    return buildExtrudedLogoGeometry({
      shapes,
      settings: config.logo,
      targetRadius,
    })
  }, [config.logo, config.model.radius, config.modelType, config.model.badgeCrossSection, shapes])

  useEffect(() => () => geometry?.dispose(), [geometry])

  return { geometry, warning }
}
