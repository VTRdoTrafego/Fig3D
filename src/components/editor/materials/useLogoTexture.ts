import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { LogoSettings } from '../../../types/domain'

function getOpaqueBounds(data: Uint8ClampedArray, width: number, height: number, alphaMin = 24) {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      if (data[i + 3] < alphaMin) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width, height }
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

export function useLogoTexture(logo: LogoSettings) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastTextureRef = useRef<THREE.Texture | null>(null)

  useEffect(() => {
    if (!logo.path) return

    let cancelled = false
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = logo.path

    image.onload = () => {
      if (cancelled) return
      const width = Math.max(1, image.naturalWidth || image.width || 1)
      const height = Math.max(1, image.naturalHeight || image.height || 1)
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = width
      sourceCanvas.height = height
      const sourceCtx = sourceCanvas.getContext('2d')
      if (!sourceCtx) {
        setError('Falha ao processar imagem.')
        return
      }
      sourceCtx.imageSmoothingEnabled = true
      sourceCtx.imageSmoothingQuality = 'high'
      sourceCtx.clearRect(0, 0, width, height)
      sourceCtx.globalAlpha = 1
      sourceCtx.drawImage(image, 0, 0, width, height)

      const sourceData = sourceCtx.getImageData(0, 0, width, height).data
      const bounds = getOpaqueBounds(sourceData, width, height, 24)

      const canvas = document.createElement('canvas')
      canvas.width = bounds.width
      canvas.height = bounds.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setError('Falha ao processar imagem.')
        return
      }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.clearRect(0, 0, bounds.width, bounds.height)
      // Crop transparent margins so front colors match extruded bounds 1:1.
      ctx.drawImage(
        sourceCanvas,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        0,
        0,
        bounds.width,
        bounds.height,
      )

      const next = new THREE.CanvasTexture(canvas)
      next.colorSpace = THREE.SRGBColorSpace
      next.premultiplyAlpha = true
      next.generateMipmaps = true
      next.magFilter = THREE.LinearFilter
      next.minFilter = THREE.LinearMipmapLinearFilter
      next.anisotropy = 8
      next.needsUpdate = true

      const last = lastTextureRef.current
      if (last) {
        last.dispose()
      }
      lastTextureRef.current = next
      setTexture(next)
      setError(null)
    }

    image.onerror = () => {
      if (!cancelled) {
        setError('Arquivo de imagem inválido.')
      }
    }

    return () => {
      cancelled = true
    }
  }, [logo.path])

  useEffect(() => {
    if (logo.path) return
    Promise.resolve().then(() => {
      const last = lastTextureRef.current
      if (last) {
        last.dispose()
        lastTextureRef.current = null
      }
      setTexture(null)
      setError(null)
    })
  }, [logo.path])

  return useMemo(() => ({ texture: logo.path ? texture : null, error }), [error, logo.path, texture])
}
