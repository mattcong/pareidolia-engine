import type { ServerStatus } from "../../model"
import "./Header.css"

const ProviderStatusIndicator = ({ server }: { server: ServerStatus | null }) => {
  if (!server) {
    return null
  }

  const color = server.connected ? "connected" : "disconnected"
  const label = server.connected
    ? `${server.provider} · ${server.model}`
    : "offline · using fallback labels"

  return (
    <div className="header__provider-label">
      <div className={`header__status-indicator header__status-indicator--${color}`} />
      {label}
    </div>
  )
}

const ProcessingStatusIndicator = ({ hasRegions }: { hasRegions: boolean }) => {
  const color = hasRegions ? "connected" : "inactive"

  return <div className={`header__status-indicator header__status-indicator--${color}`} />
}

type HeaderProps = {
  hasRegions: boolean
  hasImage: boolean
  server: ServerStatus | null
  onReset: () => void
}
export const Header = ({ hasRegions, hasImage, server, onReset }: HeaderProps) => {
  return (
    <div className="header">
      <ProcessingStatusIndicator hasRegions={hasRegions} />
      <div className="header__controls">
        <ProviderStatusIndicator server={server} />
        {!hasImage && <button onClick={onReset}>RESET</button>}
      </div>
    </div>
  )
}
