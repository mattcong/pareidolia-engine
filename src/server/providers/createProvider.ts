import type { AppConfig, Provider } from "../../types"
import { AnthropicProvider } from "./anthropic"

export const createProvider = (config: AppConfig): Provider => {
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider(config)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
