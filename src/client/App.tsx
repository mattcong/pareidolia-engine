import "./styles/App.css"
import { useCallback, useEffect, useRef, useState } from "react"
import { Header } from "./components/Header/Header"
import { getStatus } from "./query/getStatus"
import type { ServerStatus } from "../model"
import { UploadImage } from "./components/UploadImage/UploadImage"
import { Image } from "./components/Image/Image"
import type { ImageDimensions, Region } from "./types"
import { useDisplayDimensions } from "./hooks/useDisplayDimensions"
import { Overlay } from "./components/Overlay/Overlay"
import { getRegions } from "./engine/getRegions"
import { placeholderLabel } from "./engine/placeholderLabel"
import { REGION_COLORS } from "./constants"

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeId = selectedRegion ?? hoveredRegion

  const displayDimensions = useDisplayDimensions(containerRef, imageDimensions)

  useEffect(() => {
    getStatus().then(setServerStatus)
  }, [])

  const detect = useCallback(async () => {
    const img = imageRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    setProcessing(true)
    setSelectedRegion(null)

    const ctx = canvas.getContext("2d")!
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const { width, height } = imageData
    const boxes = getRegions(imageData)

    const initial: Region[] = boxes.map((box, i) => ({
      ...box,
      id: i,
      label: placeholderLabel(box, width, height),
      description: null,
      loading: true,
      color: REGION_COLORS[i % REGION_COLORS.length],
    }))
    console.log(initial)
    setRegions(initial)
    setImageDimensions({ width, height })
    setProcessing(false)
  }, [])

  useEffect(() => {
    if (!image || !imageRef.current) return
    const img = imageRef.current
    const run = () => detect()
    if (img.complete) run()
    else {
      img.addEventListener("load", run)
      return () => img.removeEventListener("load", run)
    }
  }, [image, detect])

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

  useEffect(() => {
    console.log(processing)
  }, [processing])

  const handleSelectRegion = (id: number) => {
    setSelectedRegion((prev) => (prev === id ? null : id))
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
        <div style={{ flex: 1, minWidth: 0 }}>
          {image ? (
            <div
              ref={containerRef}
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <Image imageRef={imageRef} image={image} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {imageDimensions && displayDimensions && (
                <Overlay
                  regions={regions}
                  displayDimensions={displayDimensions}
                  activeId={activeId}
                  onHover={setHoveredRegion}
                  onSelect={handleSelectRegion}
                />
              )}
            </div>
          ) : (
            <UploadImage handleFile={handleFile} />
          )}
        </div>
      </div>
    </>
  )
}

export default App
