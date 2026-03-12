export type ImageDimensions = {
  width: number
  height: number
}

export type DisplayDimensions = {
  width: number
  height: number
  scale: number // displayWidth / nativeWidth
}

export type Region = {
  id: number
  label: string
  loading: boolean
}
