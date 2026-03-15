import type { DescribeRequest, DescribeResponse } from "../../model"
import type { AppConfig, Provider } from "../../types"
import { SYSTEM_PROMPT, buildUserPrompt } from "../lib/prompt"

export class AnthropicProvider implements Provider {
  readonly name = "anthropic"
  readonly model: string
  private apiKey: string

  constructor(config: AppConfig) {
    this.apiKey = config.apiKey!
    this.model = config.model!
  }

  async healthCheck() {
    try {
      // No tokens consumed, validates key & model
      const res = await fetch("https://api.anthropic.com/v1/messages/count_tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: "test" }],
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        return {
          ok: false,
          error: `HTTP ${res.status}: ${body.slice(0, 300)}`,
        }
      }
      return { ok: true }
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message }
    }
  }

  async describe(req: DescribeRequest): Promise<DescribeResponse> {
    const start = Date.now()
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: req.image,
                },
              },
              { type: "text", text: req.prompt || buildUserPrompt() },
            ],
          },
        ],
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 300)}`)
    }

    const data = await res.json()
    const text =
      data.content
        ?.filter((b: { type: string }) => b.type === "text")
        .map((b: { type: string; text: string }) => b.text)
        .join(" ") ?? "no description"

    return {
      description: text.trim(),
      provider: this.name,
      model: this.model,
      latency: Date.now() - start,
    }
  }
}
