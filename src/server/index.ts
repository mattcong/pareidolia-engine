import express from "express"

const app = express()

const PORT = "3000"

app.get("/api/status", async (_req, res) => {
  res.json({ status: "active" })
})

const start = async () => {
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`)
  })
}

start()
