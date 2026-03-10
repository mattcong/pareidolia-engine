import express from "express"
import type { ApiStatusResponse } from "../model.js"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { loadConfig } from "./config.js"
import dotenv from "dotenv"

const app = express()

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "../../.env")
const envResult = dotenv.config({ path: envPath })

if (envResult.error) {
  dotenv.config()
}

const config = loadConfig()

app.get("/api/status", async (_req, res) => {
  const health = { ok: true }
  const response: ApiStatusResponse = {
    provider: "ollama",
    model: "llava",
    status: health.ok ? "connected" : "error",
  }
  res.json(response)
})

const start = async () => {
  console.log(`provider: ${config.provider}`)
  console.log(`model: ${config.model}`)
  console.log(`api key: ${config.apiKey ? config.apiKey.slice(0, 12) + "…" : "(none)"}`)

  app.listen(config.port, () => {
    console.log(`listening on http://localhost:${config.port}`)
  })
}

start()
