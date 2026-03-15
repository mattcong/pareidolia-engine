import { API_BASE } from "../constants"

export const describeRegions = async (
  regions: { id: number; image: string }[],
): Promise<{ results: { id: number; description: string }[] }> => {
  const res = await fetch(`${API_BASE}/describe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ regions }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
