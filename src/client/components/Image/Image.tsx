import type { Ref } from "react"
import "./Image.css"

type ImageProps = {
  overlay?: React.ReactNode
  imageRef: Ref<HTMLImageElement>
  image: string | null
}
export const Image = ({ overlay, imageRef, image }: ImageProps) => {
  if (!image) {
    return
  }
  return (
    <>
      <img ref={imageRef} src={image} alt="" className="image" />
      {overlay}
    </>
  )
}
