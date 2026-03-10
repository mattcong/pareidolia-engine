import { useEffect, useRef, useState } from "react"
import "./App.css"
import { Header } from "./client/components/Header/Header"
import { getStatus } from "./client/query/getStatus"
import type { ServerStatus } from "./model"
import { UploadImage } from "./client/components/UploadImage/UploadImage"
import { Image } from "./client/components/Image/Image"

type Region = {
  id: number
  label: string
  loading: boolean
}

function App() {
  const [regions, setRegions] = useState<Region[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)

  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    getStatus().then(setServerStatus)
  }, [])

  const onReset = () => {
    setImage(null)
    setRegions([])
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
        onReset={onReset}
      />
      <div className="page__content">
        {image ? (
          <Image imageRef={imageRef} image={image} />
        ) : (
          <UploadImage handleFile={handleFile} />
        )}
      </div>
    </>
  )
}

export default App
