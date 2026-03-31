import GIF from 'gif.js'
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url'

interface ExportGifInput {
  canvas: HTMLCanvasElement
  durationMs: number
  fps: number
  backgroundColor: string
  transparent?: boolean
  onProgress?: (value: number) => void
  beforeFrame?: (frameIndex: number, totalFrames: number) => Promise<void> | void
  outputScale?: number
  frameScale?: number
  normalizeSquare?: boolean
  fixedSize?: { width: number; height: number }
  cropToSquare?: boolean
  trimTransparentBounds?: boolean
  contentPadding?: number
  glassSafeTransparency?: boolean
}

const GIF_TRANSPARENT_KEY_HEX = 0xff00ff
const GIF_ALPHA_CUTOFF = 4
const GIF_ALPHA_CUTOFF_GLASS = 1
const KEY_R = 255
const KEY_G = 0
const KEY_B = 255

function fitTransparentContentToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: number,
  frameScale: number,
  alphaThreshold: number,
) {
  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = width
  sourceCanvas.height = height
  const sourceCtx = sourceCanvas.getContext('2d')
  if (!sourceCtx) return

  sourceCtx.drawImage(ctx.canvas as HTMLCanvasElement, 0, 0)
  const frame = sourceCtx.getImageData(0, 0, width, height)
  const { data } = frame

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      const alpha = data[i + 3]
      if (alpha <= alphaThreshold) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX || maxY < minY) return

  const contentWidth = Math.max(1, maxX - minX + 1)
  const contentHeight = Math.max(1, maxY - minY + 1)
  const safePadding = Math.min(0.2, Math.max(0, padding))
  const maxContentWidth = Math.max(1, Math.round(width * (1 - safePadding * 2)))
  const maxContentHeight = Math.max(1, Math.round(height * (1 - safePadding * 2)))
  const fitScale = Math.min(maxContentWidth / contentWidth, maxContentHeight / contentHeight) * frameScale
  const drawWidth = Math.max(1, Math.round(contentWidth * fitScale))
  const drawHeight = Math.max(1, Math.round(contentHeight * fitScale))
  const offsetX = Math.round((width - drawWidth) / 2)
  const offsetY = Math.round((height - drawHeight) / 2)

  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(sourceCanvas, minX, minY, contentWidth, contentHeight, offsetX, offsetY, drawWidth, drawHeight)
}

function applyGifTransparentKey(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  glassSafe: boolean,
) {
  const frame = ctx.getImageData(0, 0, width, height)
  const { data } = frame
  const totalPixels = width * height
  const bgMask = new Uint8Array(totalPixels)

  // If the renderer produced an opaque background, remove the border-connected area
  // using the corner color as a key reference.
  const cornerSamples = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ] as const
  let keyR = 0
  let keyG = 0
  let keyB = 0
  for (const [x, y] of cornerSamples) {
    const idx = (y * width + x) * 4
    keyR += data[idx]
    keyG += data[idx + 1]
    keyB += data[idx + 2]
  }
  keyR = Math.round(keyR / cornerSamples.length)
  keyG = Math.round(keyG / cornerSamples.length)
  keyB = Math.round(keyB / cornerSamples.length)
  const toleranceSq = glassSafe ? 44 * 44 : 92 * 92
  const alphaCutoff = glassSafe ? GIF_ALPHA_CUTOFF_GLASS : GIF_ALPHA_CUTOFF
  const cornerAlphaMean =
    cornerSamples.reduce((sum, [x, y]) => sum + data[(y * width + x) * 4 + 3], 0) / cornerSamples.length
  const opaqueBackground = cornerAlphaMean > 220

  const queueX = new Int32Array(totalPixels)
  const queueY = new Int32Array(totalPixels)
  let qStart = 0
  let qEnd = 0

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const p = y * width + x
    if (bgMask[p]) return
    const i = p * 4
    const alpha = data[i + 3]
    const dr = data[i] - keyR
    const dg = data[i + 1] - keyG
    const db = data[i + 2] - keyB
    const colorDistSq = dr * dr + dg * dg + db * db
    // When source edges are already transparent, avoid flood-filling through opaque content.
    const traversalAlphaLimit = glassSafe ? 8 : 90
    if (!opaqueBackground && alpha > traversalAlphaLimit) return
    if (colorDistSq > toleranceSq) return
    bgMask[p] = 1
    queueX[qEnd] = x
    queueY[qEnd] = y
    qEnd += 1
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0)
    enqueue(x, height - 1)
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y)
    enqueue(width - 1, y)
  }

  while (qStart < qEnd) {
    const x = queueX[qStart]
    const y = queueY[qStart]
    qStart += 1
    enqueue(x - 1, y)
    enqueue(x + 1, y)
    enqueue(x, y - 1)
    enqueue(x, y + 1)
  }

  for (let i = 0; i < data.length; i += 4) {
    const p = i / 4
    const alpha = data[i + 3]

    if (alpha <= alphaCutoff || bgMask[p]) {
      // Fully transparent pixel in GIF pipeline: enforce key color exactly.
      data[i] = KEY_R
      data[i + 1] = KEY_G
      data[i + 2] = KEY_B
      data[i + 3] = 255
      continue
    }

    // Remove premultiplied edge tint so anti-aliased borders do not pick magenta/halo.
    const a = alpha / 255
    data[i] = Math.min(255, Math.round(data[i] / a))
    data[i + 1] = Math.min(255, Math.round(data[i + 1] / a))
    data[i + 2] = Math.min(255, Math.round(data[i + 2] / a))
    data[i + 3] = 255
  }

  ctx.putImageData(frame, 0, 0)
}

export async function exportGif({
  canvas,
  durationMs,
  fps,
  backgroundColor,
  transparent = false,
  onProgress,
  beforeFrame,
  outputScale = 1,
  frameScale = 1,
  normalizeSquare = false,
  fixedSize,
  cropToSquare = false,
  trimTransparentBounds = false,
  contentPadding = 0.01,
  glassSafeTransparency = false,
}: ExportGifInput) {
  const frameDelay = Math.max(1, Math.round(1000 / fps))
  const totalFrames = Math.max(1, Math.round(durationMs / frameDelay))
  const safeOutputScale = Math.min(2, Math.max(0.25, outputScale))
  const safeFrameScale = Math.min(1.4, Math.max(0.45, frameScale))
  const sourceSize = cropToSquare ? Math.min(canvas.width, canvas.height) : null
  const sourceWidth = sourceSize ?? canvas.width
  const sourceHeight = sourceSize ?? canvas.height
  const sourceOffsetX = cropToSquare ? Math.max(0, Math.round((canvas.width - sourceWidth) / 2)) : 0
  const sourceOffsetY = cropToSquare ? Math.max(0, Math.round((canvas.height - sourceHeight) / 2)) : 0
  const fallbackBaseWidth = Math.max(2, Math.round(sourceWidth * safeOutputScale))
  const fallbackBaseHeight = Math.max(2, Math.round(sourceHeight * safeOutputScale))
  const exportWidth = fixedSize
    ? Math.max(2, Math.round(fixedSize.width))
    : normalizeSquare
      ? Math.max(fallbackBaseWidth, fallbackBaseHeight)
      : fallbackBaseWidth
  const exportHeight = fixedSize
    ? Math.max(2, Math.round(fixedSize.height))
    : normalizeSquare
      ? Math.max(fallbackBaseWidth, fallbackBaseHeight)
      : fallbackBaseHeight

  const stagingCanvas = document.createElement('canvas')
  stagingCanvas.width = exportWidth
  stagingCanvas.height = exportHeight
  const stagingCtx = stagingCanvas.getContext('2d')
  if (!stagingCtx) {
    throw new Error('Falha ao criar canvas de exportação.')
  }
  stagingCtx.imageSmoothingEnabled = true
  stagingCtx.imageSmoothingQuality = 'high'
  const safePadding = Math.min(0.2, Math.max(0, contentPadding))

  const probeCanvas = trimTransparentBounds ? document.createElement('canvas') : null
  if (probeCanvas) {
    probeCanvas.width = sourceWidth
    probeCanvas.height = sourceHeight
  }
  const probeCtx = probeCanvas?.getContext('2d') ?? null

  const gif = new GIF({
    workers: 2,
    quality: 6,
    width: exportWidth,
    height: exportHeight,
    repeat: 0,
    workerScript: gifWorkerUrl,
    background: transparent ? '#ff00ff' : backgroundColor,
    transparent: transparent ? GIF_TRANSPARENT_KEY_HEX : undefined,
  })

  for (let i = 0; i < totalFrames; i += 1) {
    await beforeFrame?.(i, totalFrames)
    if (transparent) {
      stagingCtx.clearRect(0, 0, stagingCanvas.width, stagingCanvas.height)
    } else {
      stagingCtx.fillStyle = backgroundColor
      stagingCtx.fillRect(0, 0, stagingCanvas.width, stagingCanvas.height)
    }

    let trimX = sourceOffsetX
    let trimY = sourceOffsetY
    let trimWidth = sourceWidth
    let trimHeight = sourceHeight

    if (trimTransparentBounds && probeCtx && probeCanvas) {
      probeCtx.clearRect(0, 0, sourceWidth, sourceHeight)
      probeCtx.drawImage(
        canvas,
        sourceOffsetX,
        sourceOffsetY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight,
      )

      const probe = probeCtx.getImageData(0, 0, sourceWidth, sourceHeight)
      const { data } = probe
      const alphaThreshold = glassSafeTransparency ? 6 : 10
      let minX = sourceWidth
      let minY = sourceHeight
      let maxX = -1
      let maxY = -1

      for (let py = 0; py < sourceHeight; py += 1) {
        for (let px = 0; px < sourceWidth; px += 1) {
          const idx = (py * sourceWidth + px) * 4
          if (data[idx + 3] <= alphaThreshold) continue
          if (px < minX) minX = px
          if (py < minY) minY = py
          if (px > maxX) maxX = px
          if (py > maxY) maxY = py
        }
      }

      if (maxX >= minX && maxY >= minY) {
        trimX = sourceOffsetX + minX
        trimY = sourceOffsetY + minY
        trimWidth = Math.max(1, maxX - minX + 1)
        trimHeight = Math.max(1, maxY - minY + 1)
      }
    }

    const maxContentWidth = Math.max(1, Math.round(stagingCanvas.width * (1 - safePadding * 2)))
    const maxContentHeight = Math.max(1, Math.round(stagingCanvas.height * (1 - safePadding * 2)))
    const fitScale = Math.min(maxContentWidth / trimWidth, maxContentHeight / trimHeight) * safeFrameScale
    const drawWidth = Math.max(1, Math.round(trimWidth * fitScale))
    const drawHeight = Math.max(1, Math.round(trimHeight * fitScale))
    const offsetX = Math.round((stagingCanvas.width - drawWidth) / 2)
    const offsetY = Math.round((stagingCanvas.height - drawHeight) / 2)
    stagingCtx.drawImage(canvas, trimX, trimY, trimWidth, trimHeight, offsetX, offsetY, drawWidth, drawHeight)
    if (transparent) {
      if (trimTransparentBounds) {
        fitTransparentContentToCanvas(
          stagingCtx,
          stagingCanvas.width,
          stagingCanvas.height,
          safePadding,
          safeFrameScale,
          glassSafeTransparency ? 6 : 8,
        )
      }
      applyGifTransparentKey(stagingCtx, stagingCanvas.width, stagingCanvas.height, glassSafeTransparency)
    }
    gif.addFrame(stagingCanvas, { copy: true, delay: frameDelay })
    onProgress?.(i / totalFrames)
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }

  const gifBlob = await new Promise<Blob>((resolve, reject) => {
    gif.on('progress', (progress: number) => onProgress?.(progress))
    gif.on('finished', (blob: Blob) => resolve(blob))
    gif.on('abort', () => reject(new Error('Exportação abortada.')))
    gif.render()
  })

  const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
    stagingCanvas.toBlob((blob) => {
      if (!blob) reject(new Error('Falha ao gerar thumbnail PNG.'))
      else resolve(blob)
    }, 'image/png')
  })
  return {
    gifBlob,
    thumbnailBlob,
  }
}
