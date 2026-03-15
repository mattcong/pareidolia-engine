import type { Region } from "../../types"
import "./RegionList.css"

type RegionListProps = {
  regions: Region[]
  activeId: number | null
  onHover: (id: number | null) => void
  onSelect: (id: number) => void
}
export const RegionList = ({ regions, activeId, onHover, onSelect }: RegionListProps) => {
  return (
    <div className="region-list__container">
      <div className="region-list__header">
        {regions.length} REGION{regions.length !== 1 ? "S" : ""}
      </div>

      {regions.map((region) => {
        const active = activeId === region.id
        const text = region.description || region.label

        return (
          <div
            key={region.id}
            onClick={() => onSelect(region.id)}
            onMouseEnter={() => onHover(region.id)}
            onMouseLeave={() => onHover(null)}
            className="region-list__wrap"
            style={{
              borderLeft: `2px solid ${active ? region.color : "transparent"}`,
            }}
          >
            <div className="region-list__entry">
              <div
                className="region-list__point"
                style={{
                  background: region.color,
                }}
              />
              <span
                className="region-list__label"
                style={{
                  color: region.loading ? "#333" : active ? "white" : "black",
                  background: active ? "black" : "transparent",
                  fontStyle: region.loading ? "italic" : "normal",
                }}
              >
                {region.loading ? "analyzing…" : text}
              </span>
            </div>
            <div className="region-list__dimensions">
              {region.w}×{region.h}
            </div>
          </div>
        )
      })}
    </div>
  )
}
