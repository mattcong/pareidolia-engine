import "./styles/App.css"
import { useEffect, useRef, useState } from "react"
import { Header } from "./components/Header/Header"
import { getStatus } from "./query/getStatus"
import type { ServerStatus } from "../model"
import { UploadImage } from "./components/UploadImage/UploadImage"
import { Image } from "./components/Image/Image"
import type { ImageDimensions, Region } from "./types"
import { useDisplayDimensions } from "./hooks/useDisplayDimensions"

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayDimensions = useDisplayDimensions(containerRef, imageDimensions)

  useEffect(() => {
    getStatus().then(setServerStatus)
  }, [])

  const handleReset = () => {
    setImage(null)
    setRegions([])
    setImageDimensions(null)
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    setImage(URL.createObjectURL(file))
    setRegions([])
  }

  return (
    <>
      <Header
        hasRegions={regions.length > 0}
        hasImage={!!image}
        server={serverStatus}
        onReset={handleReset}
      />
      <div className="page__content">
        {image ? (
          <>
            <Image imageRef={imageRef} image={image} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </>
        ) : (
          <UploadImage handleFile={handleFile} />
        )}
      </div>
    </>
  )
}

export default App
