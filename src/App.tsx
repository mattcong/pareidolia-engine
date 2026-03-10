import { useEffect, useState } from "react"
import "./App.css"
import { Header } from "./client/Header/Header"
import { getStatus } from "./client/query/getStatus"
import type { ServerStatus } from "./model"

type Region = {
  id: number
  label: string
  loading: boolean
}

function App() {
  const [regions, setRegions] = useState<Region[]>([])
  const [image, setImage] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)

  useEffect(() => {
    getStatus().then(setServerStatus)
  }, [])

  const onReset = () => console.log("reset")

  return (
    <>
      <Header
        hasRegions={regions.length > 0}
        hasImage={!!image}
        server={serverStatus}
        onReset={onReset}
      />
    </>
  )
}

export default App
