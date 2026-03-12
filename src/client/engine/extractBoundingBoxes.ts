import type { BoundingBox } from "../types"
import type { LabelMap } from "./types"

type ComponentBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
  pixelCount: number
}

const MIN_AREA_RATIO = 0.005
const MAX_AREA_RATIO = 0.85
const MIN_DIMENSION_PX = 10
const MAX_ASPECT_RATIO = 15
const MAX_RETURNED_BOXES = 20

const createEmptyBounds = (width: number, height: number): ComponentBounds => ({
  minX: width,
  minY: height,
  maxX: 0,
  maxY: 0,
  pixelCount: 0,
})

const expandBounds = (bounds: ComponentBounds, col: number, row: number): void => {
  bounds.minX = Math.min(bounds.minX, col)
  bounds.minY = Math.min(bounds.minY, row)
  bounds.maxX = Math.max(bounds.maxX, col)
  bounds.maxY = Math.max(bounds.maxY, row)
  bounds.pixelCount++
}

export const extractBoundingBoxes = (
  labelMap: LabelMap,
  componentCount: number,
  width: number,
  height: number,
): BoundingBox[] => {
  const imageArea = width * height

  // Get bounds for every label at once
  const boundsPerLabel = new Array<ComponentBounds>(componentCount)
  for (let label = 0; label < componentCount; label++)
    boundsPerLabel[label] = createEmptyBounds(width, height)

  for (let row = 0; row < height; row++)
    for (let col = 0; col < width; col++) {
      const label = labelMap[row * width + col]
      if (label > 0) expandBounds(boundsPerLabel[label - 1], col, row)
    }

  // Filter and convert to BoundingBox
  const boxes: BoundingBox[] = []
  for (const bounds of boundsPerLabel) {
    const boxWidth = bounds.maxX - bounds.minX
    const boxHeight = bounds.maxY - bounds.minY

    const tooSmall = bounds.pixelCount < imageArea * MIN_AREA_RATIO
    const tooLarge = bounds.pixelCount > imageArea * MAX_AREA_RATIO
    const tooDiminutive = boxWidth < MIN_DIMENSION_PX || boxHeight < MIN_DIMENSION_PX
    const tooElongated =
      boxWidth / boxHeight > MAX_ASPECT_RATIO || boxHeight / boxWidth > MAX_ASPECT_RATIO

    if (tooSmall || tooLarge || tooDiminutive || tooElongated) continue

    boxes.push({
      x: bounds.minX,
      y: bounds.minY,
      w: boxWidth,
      h: boxHeight,
      area: bounds.pixelCount,
    })
  }

  return boxes.sort((a, b) => b.area - a.area).slice(0, MAX_RETURNED_BOXES)
}
