import express from "express"
import type { ApiDescribeRequest, ApiDescribeResponse, ApiStatusResponse } from "../model.js"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { loadConfig } from "./config.js"
import dotenv from "dotenv"
import { createProvider } from "./providers/createProvider.js"
import cors from "cors"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "../../.env")
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  dotenv.config()
}

const config = loadConfig()
const provider = createProvider(config)
const app = express()

app.use(cors({ origin: `http://localhost:5173` }))
app.use(express.json({ limit: "50mb" }))

let active = 0
const MAX_CONCURRENT = 3
const waiting: (() => void)[] = []

const waitForTurn = (): Promise<void> => {
  if (active < MAX_CONCURRENT) {
    active++
    return Promise.resolve()
  }
  return new Promise<void>((resolve) => waiting.push(resolve))
}

const finishTurn = (): void => {
  const next = waiting.shift()
  if (next) {
    next()
  } else {
    active--
  }
}

const withLimit = async <T>(fn: () => Promise<T>): Promise<T> => {
  await waitForTurn()
  try {
    return await fn()
  } finally {
    finishTurn()
  }
}

app.get("/api/status", async (_req, res) => {
  const health = await provider.healthCheck()
  const response: ApiStatusResponse = {
    provider: provider.name,
    model: provider.model,
    status: health.ok ? "connected" : "error",
    ...(health.error && { error: health.error }),
  }
  res.json(response)
})

app.post("/api/describe", async (req, res) => {
  const body = req.body as ApiDescribeRequest

  if (!body.regions?.length) {
    res.status(400).json({ error: "No regions provided" })
    return
  }

  if (body.regions.length > 20) {
    res.status(400).json({ error: "Too many regions (max 20)" })
    return
  }

  try {
    const results = await Promise.all(
      body.regions.map((region) =>
        withLimit(async () => {
          try {
            const result = await provider.describe({
              image: region.image,
              prompt: "",
            })
            return { id: region.id, description: result.description }
          } catch (e: unknown) {
            console.error(`Region ${region.id} failed:`, (e as Error).message)
            return { id: region.id, description: "detection failed" }
          }
        }),
      ),
    )

    const response: ApiDescribeResponse = {
      results,
      provider: provider.name,
      model: provider.model,
    }
    res.json(response)
  } catch (e: unknown) {
    console.error("Error:", e)
    res.status(500).json({ error: (e as Error).message })
  }
})

const start = async () => {
  console.log(`provider: ${config.provider}`)
  console.log(`model: ${config.model}`)
  console.log(`api key: ${config.apiKey ? "…" + config.apiKey.slice(-4) : "(none)"}`)

  app.listen(config.port, () => {
    console.log(`listening on http://localhost:${config.port}`)
  })
}

start()
