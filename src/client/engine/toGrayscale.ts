/** Single-channel luminance values (0–255 range) */
export type GrayscaleBuffer = Float32Array

export const toGrayscale = (
  rgbaPixels: Uint8ClampedArray,
  width: number,
  height: number,
): GrayscaleBuffer => {
  const grayscale = new Float32Array(width * height) as GrayscaleBuffer
  for (let i = 0; i < width * height; i++)
    grayscale[i] =
      0.299 * rgbaPixels[i * 4] + 0.587 * rgbaPixels[i * 4 + 1] + 0.114 * rgbaPixels[i * 4 + 2]
  return grayscale
}
