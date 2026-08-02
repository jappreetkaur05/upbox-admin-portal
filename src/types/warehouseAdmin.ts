export type WarehouseStatus = 'active' | 'inactive' | 'maintenance'

export type ZonePurpose =
  | 'receiving'
  | 'storage_pick'
  | 'packing'
  | 'dispatch'
  | 'inspection'
  | 'returns'

export type WarehouseRecord = {
  id: string
  code: string
  name: string
  address: string
  city: string
  timezone: string
  operatingHours: string
  status: WarehouseStatus
  notes?: string
  capacityPercent: number
  updatedAt: string
  isPrimary?: boolean
}

export type WarehouseZoneRecord = {
  id: string
  warehouseId: string
  code: string
  name: string
  purpose: ZonePurpose
  status: 'active' | 'inactive'
  aisleCount: number
  capacityPercent: number
  workDescription: string
}

export type WarehouseAisleRecord = {
  id: string
  warehouseId: string
  zoneId: string
  code: string
  label: string
  rackCount: number
}

export type WarehouseRackRecord = {
  id: string
  warehouseId: string
  aisleId: string
  zoneId: string
  code: string
  label: string
  bayCount: number
  shelfCount: number
  fillPercent: number
  brandName: string | null
  status: 'empty' | 'in_use' | 'full'
}

export const ZONE_PURPOSE_LABELS: Record<ZonePurpose, string> = {
  receiving: 'Receiving / Goods In',
  storage_pick: 'Storage / Pick',
  packing: 'Packing',
  dispatch: 'Dispatch / Staging',
  inspection: 'Inspection / QC',
  returns: 'Returns',
}

export const ZONE_PURPOSE_COLORS: Record<ZonePurpose, string> = {
  receiving: 'bg-teal-100 text-teal-800 ring-teal-200',
  storage_pick: 'bg-sky-100 text-sky-800 ring-sky-200',
  packing: 'bg-amber-100 text-amber-900 ring-amber-200',
  dispatch: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  inspection: 'bg-rose-100 text-rose-800 ring-rose-200',
  returns: 'bg-slate-100 text-slate-700 ring-slate-200',
}

export const DEFAULT_ZONE_SEEDS: Array<{
  code: string
  name: string
  purpose: ZonePurpose
  workDescription: string
}> = [
  {
    code: 'Z-RCV',
    name: 'Receiving',
    purpose: 'receiving',
    workDescription: 'Dock receive, ASN intake, carton staging',
  },
  {
    code: 'Z-PICK',
    name: 'Storage / Pick',
    purpose: 'storage_pick',
    workDescription: 'Putaway shelves and outbound picking',
  },
  {
    code: 'Z-PACK',
    name: 'Packing',
    purpose: 'packing',
    workDescription: 'Pack QC, seal, and label print',
  },
  {
    code: 'Z-DSP',
    name: 'Dispatch',
    purpose: 'dispatch',
    workDescription: 'Route bags, FE assign, and release',
  },
  {
    code: 'Z-INSP',
    name: 'Inspection',
    purpose: 'inspection',
    workDescription: 'QC holds and damaged SKU review',
  },
]
