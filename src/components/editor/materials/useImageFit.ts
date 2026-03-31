import type { LogoFitMode } from '../../../types/domain'

interface FitRect {
  x: number
  y: number
  width: number
  height: number
}

export function getFitRect({
  mode,
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
}: {
  mode: LogoFitMode
  sourceWidth: number
  sourceHeight: number
  targetWidth: number
  targetHeight: number
}): FitRect {
  if (mode === 'stretch') {
    return { x: 0, y: 0, width: targetWidth, height: targetHeight }
  }

  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = targetWidth / targetHeight
  const useContain = mode === 'contain'

  let width = targetWidth
  let height = targetHeight

  if ((useContain && sourceRatio > targetRatio) || (!useContain && sourceRatio < targetRatio)) {
    height = targetWidth / sourceRatio
  } else {
    width = targetHeight * sourceRatio
  }

  return {
    x: (targetWidth - width) / 2,
    y: (targetHeight - height) / 2,
    width,
    height,
  }
}
