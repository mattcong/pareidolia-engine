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
import { cropRegion, getRegions } from "./engine/getRegions"
import { placeholderLabel } from "./engine/placeholderLabel"
import { REGION_COLORS } from "./constants"
import { describeRegions } from "./query/describeRegions"
import { ProcessingOverlay } from "./components/ProcessingOverlay/ProcessingOverlay"
import { RegionList } from "./components/RegionList/RegionList"

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
    setProcessing(true)

    const img = imageRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) {
      return
    }

    setSelectedRegion(null)

    // Ensure processing overlay is rendered before detection pipeline runs
    await new Promise<void>((request) =>
      requestAnimationFrame(() => {
        return setTimeout(request, 0)
      }),
    )

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

    setRegions(initial)
    setImageDimensions({ width, height })
    setProcessing(false)

    const status = await getStatus()
    setServerStatus(status)

    if (status.connected && initial.length > 0) {
      try {
        const crops = initial.map((region) => ({
          id: region.id,
          image: cropRegion(canvas, region),
        }))
        const response = await describeRegions(crops)
        setRegions((prev) =>
          prev.map((region) => {
            const match = response.results.find((res) => res.id === region.id)
            return {
              ...region,
              description: match?.description ?? null,
              loading: false,
            }
          }),
        )
      } catch (e) {
        console.error("Model labeling failed:", e)
        setRegions((prev) => prev.map((region) => ({ ...region, loading: false })))
      }
    } else {
      setRegions((prev) => prev.map((region) => ({ ...region, loading: false })))
    }
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
    if (image) {
      URL.revokeObjectURL(image)
    }
    setImage(null)
    setRegions([])
    setImageDimensions(null)
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    setImage(URL.createObjectURL(file))
    setRegions([])
  }

  const handleSelectRegion = (id: number) => {
    setSelectedRegion((prev) => (prev === id ? null : id))
  }

  const hasRegions = regions.length > 0

  return (
    <>
      <Header
        hasRegions={hasRegions}
        hasImage={!!image}
        server={serverStatus}
        onReset={handleReset}
      />
      <div className="page__content">
        <div className="page__content__detection-view">
          {image ? (
            <>
              <div ref={containerRef} className="page__content__image-view">
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
                {processing && <ProcessingOverlay />}
              </div>
              {hasRegions && (
                <RegionList
                  regions={regions}
                  activeId={activeId}
                  onHover={setHoveredRegion}
                  onSelect={handleSelectRegion}
                />
              )}
            </>
          ) : (
            <UploadImage handleFile={handleFile} />
          )}
        </div>
      </div>
    </>
  )
}

export default App
