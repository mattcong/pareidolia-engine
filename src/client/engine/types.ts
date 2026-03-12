/** Post-blur smoothed luminance */
export type SmoothedBuffer = Float32Array
/** Per-pixel gradient magnitude from edge detection */
export type EdgeMagnitudeBuffer = Float32Array
/** Binary mask: 1 = foreground, 0 = background */
export type BinaryMask = Uint8Array
/** Per-pixel component label (0 = unlabeled) */
export type LabelMap = Int32Array
