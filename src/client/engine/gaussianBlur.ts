import type { GrayscaleBuffer } from "./toGrayscale"
import type { SmoothedBuffer } from "./types"

type KernelEntry = {
  offsetX: number
  offsetY: number
  weight: number
}

const buildGaussianKernel = (radius: number, sigma: number): KernelEntry[] => {
  const entries: KernelEntry[] = []
  let weightSum = 0

  for (let offsetY = -radius; offsetY <= radius; offsetY++)
    for (let offsetX = -radius; offsetX <= radius; offsetX++) {
      const weight = Math.exp(-(offsetX * offsetX + offsetY * offsetY) / (2 * sigma * sigma))
      entries.push({ offsetX, offsetY, weight })
      weightSum += weight
    }

  for (const entry of entries) entry.weight /= weightSum
  return entries
}

export const gaussianBlur = (
  grayscale: GrayscaleBuffer,
  width: number,
  height: number,
  radius = 2,
  sigma = 1,
): SmoothedBuffer => {
  const kernel = buildGaussianKernel(radius, sigma)
  const blurred = new Float32Array(width * height)

  for (let row = 0; row < height; row++)
    for (let col = 0; col < width; col++) {
      let accumulatedValue = 0
      for (const { offsetX, offsetY, weight } of kernel) {
        const sampleCol = Math.min(Math.max(col + offsetX, 0), width - 1)
        const sampleRow = Math.min(Math.max(row + offsetY, 0), height - 1)
        accumulatedValue += grayscale[sampleRow * width + sampleCol] * weight
      }
      blurred[row * width + col] = accumulatedValue
    }
  return blurred
}
