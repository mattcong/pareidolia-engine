export type ImageDimensions = {
  width: number
  height: number
}

export type DisplayDimensions = {
  width: number
  height: number
  scale: number // displayWidth / nativeWidth
}

export type BoundingBox = {
  x: number
  y: number
  w: number
  h: number
  area: number
}

export type Region = BoundingBox & {
  id: number
  label: string
  description: string | null
  loading: boolean
  color: string
}
