import type { BinaryMask, LabelMap } from "./types"

const FOUR_CONNECTED_OFFSETS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

export const labelConnectedComponents = (
  binaryMask: BinaryMask,
  width: number,
  height: number,
): { labelMap: LabelMap; componentCount: number } => {
  const labelMap = new Int32Array(width * height)
  let nextLabel = 1
  const floodStack: [number, number][] = []

  for (let row = 0; row < height; row++)
    for (let col = 0; col < width; col++) {
      const index = row * width + col
      if (binaryMask[index] !== 1 || labelMap[index] !== 0) continue

      const currentLabel = nextLabel++
      labelMap[index] = currentLabel
      floodStack.push([col, row])

      while (floodStack.length) {
        const [currentCol, currentRow] = floodStack.pop()!

        for (const [deltaCol, deltaRow] of FOUR_CONNECTED_OFFSETS) {
          const neighborCol = currentCol + deltaCol
          const neighborRow = currentRow + deltaRow
          if (neighborCol < 0 || neighborCol >= width || neighborRow < 0 || neighborRow >= height)
            continue
          const neighborIndex = neighborRow * width + neighborCol
          if (binaryMask[neighborIndex] !== 1 || labelMap[neighborIndex] !== 0) continue
          labelMap[neighborIndex] = currentLabel
          floodStack.push([neighborCol, neighborRow])
        }
      }
    }
  return { labelMap, componentCount: nextLabel - 1 }
}
