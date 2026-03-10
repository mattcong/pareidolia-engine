import { useRef, useCallback } from "react"
import "./UploadImage.css"

type UploadImageProps = {
  handleFile: (file: File) => void
}
export const UploadImage = ({ handleFile }: UploadImageProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onClick={() => inputRef.current?.click()}
      className="upload-image__wrap"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFile(file)
          }
        }}
      />
      <span className="upload-image__label">DROP IMAGE</span>
    </div>
  )
}
