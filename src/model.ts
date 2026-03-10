export type ApiStatusResponse = {
  provider: string
  model: string
  status: "connected" | "error"
  error?: string
}

export type ServerStatus = {
  connected: boolean
  provider: string | null
  model: string | null
  error?: string
}
