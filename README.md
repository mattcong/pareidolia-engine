# Pareidolia Engine

Detects visual forms in images using client-side region proposals and LLM generated descriptions.

![pareidolia engine](/docs/pareidolia-engine.png)

## Setup

```
npm install
cp .env.example .env
```

Edit `.env`:

```
PROVIDER=[provider]
API_KEY=[your_api_key] - ignored for ollama
MODEL=[model] - override default provider model (see below)
OLLAMA_HOST=http://localhost:[ollama_port] - ollama port
PORT=[server_port] - server port
```

### Providers

Currently supported:

| Provider  | `PROVIDER`  | `API_KEY` | Default model              |
| --------- | ----------- | --------- | -------------------------- |
| Anthropic | `anthropic` | Required  | `claude-sonnet-4-20250514` |
| Ollama    | `ollama`    | -         | `llava`                    |

For Ollama, the model must support vision (llava, bakllava, moondream)

## Run

```
npm run dev
```

Or to run client and server in separate terminals:

```
npm run dev:client
```

```
npm run dev:server
```

## Image processing workflow

### Client
Identifies regions in the image using an edge-based object detection pipeline:

1. Grayscale - convert to brightness-only
2. Blur - reduce noise
3. Edge detection - find boundaries where brightness changes sharply (Sobel operator)
4. Threshold - discard faint edges, keeping only those above the image average
5. Dilation - thicken remaining edges so nearby fragments merge
6. Component labeling - group each connected blob of edge pixels into a distinct region
7. Bounding boxes - fit a rectangle around each region
8. Non-maximum suppression - where rectangles overlap significantly, keep only the best one
9. Crop - extract each region as a JPEG

### Server
Cropped regions are then sent to an LLM vision API which returns a natural language description of the form it sees.
