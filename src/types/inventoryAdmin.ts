export type ProductMaster = {
  id: string
  name: string
  brandId: string
  category: string
  description: string
  imageUrl?: string
  gstPercent: number
  manufacturer: string
  hsnCode: string
  status: 'active' | 'inactive'
}

export type SkuMasterRow = {
  id: string
  sku: string
  productId: string
  productName: string
  barcode: string
  brandId: string
  category: string
  unit: string
  weightKg: number
  dimensionsCm: string
  status: 'active' | 'inactive'
}

export type AdjustmentReason =
  | 'theft'
  | 'miscount'
  | 'product_found'
  | 'product_lost'
  | 'manual'
  | 'damaged_handling'

export type InventoryAdjustment = {
  id: string
  sku: string
  skuName: string
  beforeQty: number
  afterQty: number
  delta: number
  reason: AdjustmentReason
  notes: string
  userName: string
  at: string
}

export type BatchLot = {
  id: string
  batchCode: string
  sku: string
  skuName: string
  manufacturedAt: string
  expiresAt: string
  qtyOnHand: number
  locationCode: string
}

export type SerialUnit = {
  id: string
  serial: string
  sku: string
  skuName: string
  status: 'in_stock' | 'reserved' | 'sold' | 'damaged'
  locationCode: string | null
}

export type DamagedRecord = {
  id: string
  sku: string
  skuName: string
  qty: number
  reason: string
  status: 'repair' | 'return_supplier' | 'scrap' | 'dispose' | 'insurance'
  at: string
}

export type AuditStatus = 'open' | 'in_progress' | 'closed'

export type InventoryAudit = {
  id: string
  name: string
  scope: string
  status: AuditStatus
  lines: { sku: string; skuName: string; systemQty: number; actualQty: number | null }[]
  createdAt: string
}

export type CycleCountPlan = {
  id: string
  dayLabel: string
  scope: string
  status: 'planned' | 'in_progress' | 'done'
  systemQty: number
  actualQty: number | null
}

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  theft: 'Theft',
  miscount: 'Miscount',
  product_found: 'Product found',
  product_lost: 'Product lost',
  manual: 'Manual correction',
  damaged_handling: 'Damaged during handling',
}

export const DAMAGED_STATUS_LABELS: Record<DamagedRecord['status'], string> = {
  repair: 'Repair',
  return_supplier: 'Return to Supplier',
  scrap: 'Scrap',
  dispose: 'Dispose',
  insurance: 'Insurance Claim',
}
