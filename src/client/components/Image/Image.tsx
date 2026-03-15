import type { Ref } from "react"
import "./Image.css"

type ImageProps = {
  imageRef: Ref<HTMLImageElement>
  image: string | null
}
export const Image = ({ imageRef, image }: ImageProps) => {
  if (!image) {
    return
  }
  return <img ref={imageRef} src={image} alt="" className="image" />
}
