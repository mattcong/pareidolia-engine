import type { BoundingBox } from "../types"
import { sobelEdgeDetect, adaptiveThreshold, dilateBinaryMask } from "./edgeDetect"
import { extractBoundingBoxes } from "./extractBoundingBoxes"
import { gaussianBlur } from "./gaussianBlur"
import { labelConnectedComponents } from "./labelComponents"
import { toGrayscale } from "./toGrayscale"

export const getRegions = (imageData: ImageData): BoundingBox[] => {
  const { data: rgbaPixels, width, height } = imageData

  const grayscale = toGrayscale(rgbaPixels, width, height)
  const smoothed = gaussianBlur(grayscale, width, height)
  const edgeMagnitudes = sobelEdgeDetect(smoothed, width, height)
  const binaryEdges = adaptiveThreshold(edgeMagnitudes)
  const dilatedEdges = dilateBinaryMask(binaryEdges, width, height)
  const { labelMap, componentCount } = labelConnectedComponents(dilatedEdges, width, height)
  const candidateBoxes = extractBoundingBoxes(labelMap, componentCount, width, height)

  return candidateBoxes
}
