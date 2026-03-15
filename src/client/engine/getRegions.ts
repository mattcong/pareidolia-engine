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

export const cropRegion = (
  sourceCanvas: HTMLCanvasElement,
  box: BoundingBox,
  padding = 4,
): string => {
  const cropX = Math.max(0, box.x - padding)
  const cropY = Math.max(0, box.y - padding)
  const cropWidth = Math.min(sourceCanvas.width - cropX, box.w + padding * 2)
  const cropHeight = Math.min(sourceCanvas.height - cropY, box.h + padding * 2)

  const cropCanvas = document.createElement("canvas")
  cropCanvas.width = cropWidth
  cropCanvas.height = cropHeight
  cropCanvas
    .getContext("2d")!
    .drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

  const dataUrl = cropCanvas.toDataURL("image/jpeg", 0.85)
  return dataUrl.split(",")[1]
}
