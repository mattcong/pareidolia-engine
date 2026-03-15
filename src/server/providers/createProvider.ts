import type { AppConfig, Provider } from "../../types"
import { AnthropicProvider } from "./anthropic"
import { OllamaProvider } from "./ollama"

export const createProvider = (config: AppConfig): Provider => {
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider(config)
    case "ollama":
      return new OllamaProvider(config)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
