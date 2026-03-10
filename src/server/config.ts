import type { AppConfig, ProviderType } from "../types"

const VALID_PROVIDERS: ProviderType[] = ["anthropic", "ollama"]

const DEFAULT_MODELS: Record<ProviderType, string> = {
  anthropic: "claude-sonnet-4-20250514",
  ollama: "llava",
}

export const loadConfig = (): AppConfig => {
  const providerFromEnv = (process.env.PROVIDER ?? "anthropic").toLowerCase()

  if (!VALID_PROVIDERS.includes(providerFromEnv as ProviderType)) {
    console.error(
      `Invalid PROVIDER="${providerFromEnv}". Must be one of: ${VALID_PROVIDERS.join(", ")}`,
    )
    process.exit(1)
  }

  const provider = providerFromEnv as ProviderType
  const apiKey = process.env.API_KEY

  if (provider !== "ollama" && !apiKey) {
    console.error(`API_KEY is required for provider "${provider}".`)
    console.error("Ensure your .env file exists and contains API_KEY=...")
    process.exit(1)
  }

  if (apiKey && (apiKey === "your-api-key-here" || apiKey.length < 10)) {
    console.warn("API_KEY looks like a placeholder, check your .env file")
  }

  return {
    provider,
    apiKey,
    model: process.env.MODEL ?? DEFAULT_MODELS[provider],
    ollamaHost: process.env.OLLAMA_HOST ?? "http://localhost:11434",
    port: parseInt(process.env.PORT ?? "3001", 10),
  }
}
