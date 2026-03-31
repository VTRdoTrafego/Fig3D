import JSZip from 'jszip'
import { exportGif } from '../../../services/export/exportGif'

export type ExportFormat = 'gif' | 'webm-alpha' | 'png-sequence' | 'apng'

export async function exportTransparentAnimation({
  canvas,
  durationMs,
  fps,
  format,
  backgroundColor,
  transparent,
  onProgress,
}: {
  canvas: HTMLCanvasElement
  durationMs: number
  fps: number
  format: ExportFormat
  backgroundColor: string
  transparent: boolean
  onProgress?: (value: number) => void
}) {
  if (format === 'gif') {
    return exportGif({
      canvas,
      durationMs,
      fps,
      backgroundColor,
      transparent,
      onProgress,
    })
  }

  if (format === 'webm-alpha') {
    const stream = canvas.captureStream(fps)
    const chunks: BlobPart[] = []
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data)
    }
    recorder.start()
    await new Promise((resolve) => setTimeout(resolve, durationMs))
    recorder.stop()
    await new Promise((resolve) => {
      recorder.onstop = resolve
    })
    const blob = new Blob(chunks, { type: 'video/webm' })
    return { webmBlob: blob }
  }

  const frameDelay = Math.max(1, Math.round(1000 / fps))
  const totalFrames = Math.max(1, Math.round(durationMs / frameDelay))
  const zip = new JSZip()

  for (let i = 0; i < totalFrames; i += 1) {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('Falha ao capturar frame PNG.'))
      }, 'image/png')
    })
    zip.file(`frame-${String(i).padStart(4, '0')}.png`, blob)
    onProgress?.((i + 1) / totalFrames)
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }

  const archive = await zip.generateAsync({ type: 'blob' })
  if (format === 'apng') {
    return {
      warning:
        'APNG real requer encoder dedicado. Gerado ZIP com frames PNG para conversão sem perda de alpha.',
      pngSequenceZip: archive,
    }
  }
  return { pngSequenceZip: archive }
}
