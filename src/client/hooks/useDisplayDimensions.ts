import { useState, useEffect } from "react"
import type { ImageDimensions, DisplayDimensions } from "../types"

export const useDisplayDimensions = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  imageDimensions: ImageDimensions | null,
) => {
  const [displayDimensions, setDisplayDimensions] = useState<DisplayDimensions | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !imageDimensions) return

    const update = () => {
      const rect = container.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setDisplayDimensions({
          width: rect.width,
          height: rect.height,
          scale: rect.width / imageDimensions.width,
        })
      }
    }

    const observer = new ResizeObserver(update)
    observer.observe(container)
    update()
    return () => observer.disconnect()
  }, [imageDimensions, containerRef])

  return displayDimensions
}
