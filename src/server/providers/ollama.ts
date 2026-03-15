import type { DescribeRequest, DescribeResponse } from "../../model.js"
import type { Provider, AppConfig } from "../../types.js"
import { OLLAMA_SYSTEM_PROMPT, OLLAMA_USER_PROMPT } from "../lib/prompt.js"

export class OllamaProvider implements Provider {
  readonly name = "ollama"
  readonly model: string
  private host: string

  constructor(config: AppConfig) {
    this.model = config.model!
    this.host = config.ollamaHost!.replace(/\/+$/, "")
  }

  async healthCheck() {
    try {
      const res = await fetch(`${this.host}/api/tags`)
      if (!res.ok) {
        return { ok: false, error: `Ollama responded with HTTP ${res.status}` }
      }
      const data = await res.json()
      const models: string[] = (data.models ?? []).map((model: { name: string }) => model.name)
      const available = models.some(
        (model) => model === this.model || model.startsWith(`${this.model}:`),
      )
      if (!available) {
        return {
          ok: false,
          error: `Model "${this.model}" not found. Available: ${models.join(", ") || "none"}`,
        }
      }
      return { ok: true }
    } catch (e: unknown) {
      return { ok: false, error: `Cannot reach Ollama at ${this.host}: ${(e as Error).message}` }
    }
  }

  async describe(req: DescribeRequest): Promise<DescribeResponse> {
    const start = Date.now()
    const res = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: "system", content: OLLAMA_SYSTEM_PROMPT },
          {
            role: "user",
            content: req.prompt || OLLAMA_USER_PROMPT,
            images: [req.image],
          },
        ],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Ollama error ${res.status}: ${body.slice(0, 300)}`)
    }

    const data = await res.json()
    const text = data.message?.content ?? "no description"

    return {
      description: text.trim(),
      provider: this.name,
      model: this.model,
      latency: Date.now() - start,
    }
  }
}
