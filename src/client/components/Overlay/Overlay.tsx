import "./Overlay.css"
import type { Region, DisplayDimensions } from "../../types"

type OverlayProps = {
  regions: Region[]
  displayDimensions: DisplayDimensions
  activeId: number | null
  onHover: (id: number | null) => void
  onSelect: (id: number) => void
}
export const Overlay = ({
  regions,
  displayDimensions,
  activeId,
  onHover,
  onSelect,
}: OverlayProps) => {
  const { scale } = displayDimensions

  return (
    <svg
      className="overlay"
      style={{
        width: displayDimensions.width,
        height: displayDimensions.height,
      }}
      viewBox={`0 0 ${displayDimensions.width} ${displayDimensions.height}`}
    >
      {regions.map((r) => {
        const active = activeId === r.id
        const dimmed = activeId !== null && !active
        const text = r.description || r.label

        // Scale native image coordinates to display coordinates
        const dx = r.x * scale
        const dy = r.y * scale
        const dw = r.w * scale
        const dh = r.h * scale

        return (
          <g key={r.id} opacity={dimmed ? 0.1 : active ? 1 : 0.6}>
            <rect
              x={dx}
              y={dy}
              width={dw}
              height={dh}
              fill={active ? `${r.color}08` : "none"}
              stroke={r.color}
              strokeWidth={active ? 2 : 1}
              style={{ pointerEvents: "all", cursor: "pointer" }}
              onMouseEnter={() => onHover(r.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(r.id)}
            />
            <foreignObject
              x={dx}
              y={dy}
              width={dw}
              height={dh}
              style={{ pointerEvents: "none", overflow: "hidden" }}
            >
              <div className="overlay__box">
                <span
                  className="overlay__box-label"
                  style={{
                    color: r.color,
                    opacity: r.loading ? 0.4 : 1,
                  }}
                >
                  {r.loading ? "…" : text}
                </span>
              </div>
            </foreignObject>
          </g>
        )
      })}
    </svg>
  )
}
