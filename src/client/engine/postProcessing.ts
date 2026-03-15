import type { BoundingBox } from "../types"

const computeIntersectionOverUnion = (boxA: BoundingBox, boxB: BoundingBox): number => {
  const intersectLeft = Math.max(boxA.x, boxB.x)
  const intersectTop = Math.max(boxA.y, boxB.y)
  const intersectRight = Math.min(boxA.x + boxA.w, boxB.x + boxB.w)
  const intersectBottom = Math.min(boxA.y + boxA.h, boxB.y + boxB.h)

  if (intersectRight <= intersectLeft || intersectBottom <= intersectTop) return 0

  const intersectionArea = (intersectRight - intersectLeft) * (intersectBottom - intersectTop)
  const unionArea = boxA.w * boxA.h + boxB.w * boxB.h - intersectionArea
  return intersectionArea / unionArea
}

export const nonMaximumSuppression = (boxes: BoundingBox[], iouThreshold = 0.45): BoundingBox[] => {
  const retained: BoundingBox[] = []
  const suppressed = new Set<number>()

  for (let i = 0; i < boxes.length; i++) {
    if (suppressed.has(i)) continue
    retained.push(boxes[i])

    for (let j = i + 1; j < boxes.length; j++) {
      if (suppressed.has(j)) continue
      if (computeIntersectionOverUnion(boxes[i], boxes[j]) > iouThreshold) suppressed.add(j)
    }
  }
  return retained
}
