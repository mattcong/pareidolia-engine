import express from "express"
import type { ApiStatusResponse } from "../model.js"

const app = express()

const PORT = "3001"

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
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`)
  })
}

start()
