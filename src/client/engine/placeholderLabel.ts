import type { BoundingBox } from "../types"

export const placeholderLabel = (box: BoundingBox, imgW: number, imgH: number): string => {
  const ratio = box.w / box.h
  const rel = (box.w * box.h) / (imgW * imgH)
  const shape =
    ratio > 2.5
      ? "linear form"
      : ratio < 0.4
        ? "vertical axis"
        : ratio > 1.3
          ? "lateral mass"
          : ratio < 0.75
            ? "upright figure"
            : "contained shape"
  const scale = rel > 0.25 ? "dominant" : rel > 0.08 ? "secondary" : "detail"
  return `${scale} · ${shape}`
}
