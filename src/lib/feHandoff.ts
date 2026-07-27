import type { FeHandoffParcel } from '@/types/outbound'
import { HANDOFF_STORAGE_KEY } from '@/types/outbound'

export function readFeHandoff(): FeHandoffParcel[] {
  try {
    const raw = localStorage.getItem(HANDOFF_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FeHandoffParcel[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeFeHandoff(parcels: FeHandoffParcel[]) {
  localStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(parcels))
}

export function upsertFeHandoff(parcels: FeHandoffParcel[]) {
  const existing = readFeHandoff()
  const map = new Map(existing.map((p) => [p.parcelId, p]))
  for (const p of parcels) map.set(p.parcelId, p)
  writeFeHandoff([...map.values()])
}

export function removeFeHandoffForOrders(orderNumbers: string[]) {
  const set = new Set(orderNumbers)
  writeFeHandoff(readFeHandoff().filter((p) => !set.has(p.orderNumber)))
}
