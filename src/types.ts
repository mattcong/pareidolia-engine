export type ProviderType = "anthropic" | "ollama"

export type AppConfig = {
  provider: ProviderType
  apiKey?: string
  model?: string
  ollamaHost?: string
  port: number
}
