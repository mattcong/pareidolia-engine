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

export type DescribeRequest = {
  image: string
  prompt: string
}

export type DescribeResponse = {
  description: string
  provider: string
  model: string
  latency: number
}
