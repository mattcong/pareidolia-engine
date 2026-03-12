import type { GrayscaleBuffer } from "./toGrayscale"
import type { BinaryMask, EdgeMagnitudeBuffer, SmoothedBuffer } from "./types"

/* prettier-ignore */
const SOBEL_HORIZONTAL = [
  [-1, 0, +1],
  [-2, 0, +2],
  [-1, 0, +1],
]

/* prettier-ignore */
const SOBEL_VERTICAL = [
  [-1, -2, -1],
  [ 0,  0,  0],
  [+1, +2, +1],
]

const applyKernel = (
  grayscale: GrayscaleBuffer,
  width: number,
  row: number,
  col: number,
  kernel: number[][],
): number => {
  let sum = 0
  for (let kernelRow = 0; kernelRow < 3; kernelRow++)
    for (let kernelCol = 0; kernelCol < 3; kernelCol++)
      sum +=
        kernel[kernelRow][kernelCol] *
        grayscale[(row + kernelRow - 1) * width + (col + kernelCol - 1)]
  return sum
}

export const sobelEdgeDetect = (
  smoothed: SmoothedBuffer,
  width: number,
  height: number,
): EdgeMagnitudeBuffer => {
  const edgeMagnitudes = new Float32Array(width * height)

  for (let row = 1; row < height - 1; row++)
    for (let col = 1; col < width - 1; col++) {
      const horizontalGradient = applyKernel(smoothed, width, row, col, SOBEL_HORIZONTAL)
      const verticalGradient = applyKernel(smoothed, width, row, col, SOBEL_VERTICAL)
      edgeMagnitudes[row * width + col] = Math.sqrt(
        horizontalGradient * horizontalGradient + verticalGradient * verticalGradient,
      )
    }
  return edgeMagnitudes
}

export const adaptiveThreshold = (edgeMagnitudes: EdgeMagnitudeBuffer): BinaryMask => {
  let edgeSum = 0
  let edgeCount = 0
  for (let i = 0; i < edgeMagnitudes.length; i++)
    if (edgeMagnitudes[i] > 0) {
      edgeSum += edgeMagnitudes[i]
      edgeCount++
    }

  const cutoff = (edgeSum / (edgeCount || 1)) * 1.2
  const binaryMask = new Uint8Array(edgeMagnitudes.length)
  for (let i = 0; i < edgeMagnitudes.length; i++) binaryMask[i] = edgeMagnitudes[i] > cutoff ? 1 : 0
  return binaryMask
}

export const dilateBinaryMask = (
  binaryMask: BinaryMask,
  width: number,
  height: number,
  radius = 4,
): BinaryMask => {
  let currentMask = binaryMask

  for (let i = 0; i < radius; i++) {
    const expandedMask = new Uint8Array(width * height)
    for (let row = 1; row < height - 1; row++)
      for (let col = 1; col < width - 1; col++) {
        const index = row * width + col
        if (
          currentMask[index] ||
          currentMask[index - width] ||
          currentMask[index + width] ||
          currentMask[index - 1] ||
          currentMask[index + 1]
        )
          expandedMask[index] = 1
      }
    currentMask = expandedMask
  }
  return currentMask
}
