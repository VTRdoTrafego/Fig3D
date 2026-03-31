import { contours, type ContourMultiPolygon } from 'd3-contour'
import * as THREE from 'three'

interface TraceResult {
  shapes: THREE.Shape[]
  complexityScore: number
}

function toVector(points: Array<[number, number]>, width: number, height: number) {
  return points.map(([x, y]) => new THREE.Vector2(x - width / 2, height / 2 - y))
}

function simplify(points: THREE.Vector2[], step: number) {
  if (points.length <= step) return points
  const result: THREE.Vector2[] = []
  for (let i = 0; i < points.length; i += step) {
    result.push(points[i])
  }
  if (!result[0].equals(result[result.length - 1])) {
    result.push(result[0].clone())
  }
  return result
}

export function traceAlphaToShapes({
  imageData,
  width,
  height,
  threshold = 0.55,
}: {
  imageData: Uint8ClampedArray
  width: number
  height: number
  threshold?: number
}): TraceResult {
  const values = new Array<number>(width * height)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      values[y * width + x] = imageData[i + 3] / 255
    }
  }

  const contourFeature = contours().size([width, height]).thresholds([threshold])(values)[0] as
    | ContourMultiPolygon
    | undefined
  if (!contourFeature) {
    return { shapes: [], complexityScore: 0 }
  }

  const shapes: THREE.Shape[] = []
  let complexityScore = 0

  contourFeature.coordinates.forEach((polygon: number[][][]) => {
    if (!polygon.length) return
    const [outer, ...holes] = polygon
    const outerVectors = simplify(toVector(outer as Array<[number, number]>, width, height), 1)
    if (outerVectors.length < 3) return

    const outerClockWise = THREE.ShapeUtils.isClockWise(outerVectors)
    const shape = new THREE.Shape(outerClockWise ? [...outerVectors].reverse() : outerVectors)
    complexityScore += outerVectors.length

    holes.forEach((holeCoords: number[][]) => {
      const holeVectors = simplify(toVector(holeCoords as Array<[number, number]>, width, height), 1)
      if (holeVectors.length < 3) return
      complexityScore += holeVectors.length
      const holePath = new THREE.Path(
        THREE.ShapeUtils.isClockWise(holeVectors) ? holeVectors : [...holeVectors].reverse(),
      )
      shape.holes.push(holePath)
    })

    shapes.push(shape)
  })

  return { shapes, complexityScore }
}
