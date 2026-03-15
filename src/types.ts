import type { DescribeRequest, DescribeResponse } from "./model"

export type ProviderType = "anthropic" | "ollama"

export type AppConfig = {
  provider: ProviderType
  apiKey?: string
  model?: string
  ollamaHost?: string
  port: number
}

export type Provider = {
  readonly name: string
  readonly model: string
  healthCheck(): Promise<{ ok: boolean; error?: string }>
  describe(req: DescribeRequest): Promise<DescribeResponse>
}
