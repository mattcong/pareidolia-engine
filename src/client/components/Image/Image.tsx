import type { Ref } from "react"
import "./Image.css"

export const Image = ({
  overlay,
  imageRef,
  image,
}: {
  overlay?: React.ReactNode
  imageRef: Ref<HTMLImageElement>
  image: string
}) => {
  return (
    <>
      <img ref={imageRef} src={image} alt="" className="image" />
      {overlay}
    </>
  )
}
