import type { ServerStatus } from "../../model"
import { API_BASE } from "../constants"

export const getStatus = async (): Promise<ServerStatus> => {
  try {
    const res = await fetch(`${API_BASE}/status`)
    if (!res.ok) {
      return { connected: false, provider: null, model: null }
    }
    const data = await res.json()
    return {
      connected: data.status === "connected",
      provider: data.provider,
      model: data.model,
      error: data.error,
    }
  } catch {
    return { connected: false, provider: null, model: null }
  }
}
