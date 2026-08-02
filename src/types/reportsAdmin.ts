export type DateRangePreset = 'today' | '7d' | '30d' | 'this_month' | 'custom'

export type InventoryReportKind =
  | 'current_stock'
  | 'movement'
  | 'valuation'
  | 'low_stock'
  | 'overstock'
  | 'batch'
  | 'serial'
  | 'expiry'

export type OrderReportStatus =
  | 'daily'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'return'
  | 'rto'

export type UserActivityType =
  | 'login'
  | 'inventory'
  | 'order'
  | 'scan'
  | 'adjustment'
  | 'approval'

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json'

export type ExportJobStatus = 'queued' | 'ready' | 'failed' | 'scheduled'

export type SlaArea =
  | 'receiving'
  | 'putaway'
  | 'picking'
  | 'packing'
  | 'dispatch'
  | 'delivery'

export type AgeingBucket = '0-30' | '31-90' | '91-180' | '180+'

export type DeadStockAction =
  | 'promotion'
  | 'liquidation'
  | 'return_supplier'
  | 'scrap'
  | 'bundle'

export type ReportFilterState = {
  dateRange: DateRangePreset
  warehouse: string
  brand: string
  sku: string
  customer: string
  courier: string
}

export type InventoryReportRow = {
  id: string
  kind: InventoryReportKind
  sku: string
  name: string
  warehouse: string
  brand: string
  qty: number
  value: number
  detail: string
}

export type InboundReportRow = {
  id: string
  grn: string
  supplier: string
  poNumber: string
  warehouse: string
  itemsReceived: number
  receivingMins: number
  putawayMins: number
  onTime: boolean
  at: string
}

export type OutboundReportRow = {
  id: string
  shipmentId: string
  orderId: string
  courier: string
  warehouse: string
  status: 'dispatched' | 'in_transit' | 'delivered' | 'failed'
  pickAccuracyPct: number
  at: string
}

export type OrderReportRow = {
  id: string
  orderId: string
  brand: string
  channel: string
  status: OrderReportStatus
  warehouse: string
  amount: number
  hour: number
  at: string
}

export type NamedMetric = { label: string; value: number }

export type WarehousePerfSnapshot = {
  spaceUtilizationPct: number
  rackOccupancyPct: number
  avgPickSecs: number
  packingPerHour: number
  dockUtilizationPct: number
  workforceProductivityPct: number
  warehouseRanking: NamedMetric[]
  pickTrend: number[]
}

export type UserActivityEvent = {
  id: string
  type: UserActivityType
  user: string
  entity: string
  detail: string
  at: string
}

export type FinancialReportSnapshot = {
  revenue: number
  customerBilling: number
  vendorPayments: number
  outstanding: number
  warehouseRevenue: number
  storageRevenue: number
  pickPackRevenue: number
  gstCollected: number
  expenses: number
  profit: number
  monthlyRevenue: number
  operationalCost: number
  grossMarginPct: number
}

export type KpiDashboardSnapshot = {
  ordersToday: number
  ordersDispatched: number
  goodsReceived: number
  inventoryAccuracyPct: number
  avgPickTimeLabel: string
  warehouseRevenue: number
  lowStockSkus: number
  deadStockValue: number
  fillRatePct: number
  orderAccuracyPct: number
  pickingAccuracyPct: number
  packingAccuracyPct: number
  dispatchSlaPct: number
  returnRatePct: number
  rtoRatePct: number
  customerSatisfaction: number
  warehouseUtilizationPct: number
  revenueGrowthPct: number
  costPerOrder: number
}

export type ExportJob = {
  id: string
  reportName: string
  format: ExportFormat
  status: ExportJobStatus
  createdAt: string
  schedule: string | null
  email: string | null
}

export type SlaMetric = {
  id: string
  area: SlaArea
  percent: number
  target: number
  warehouse: string
}

export type AgeingBucketRow = {
  id: string
  sku: string
  name: string
  warehouse: string
  brand: string
  qty: number
  value: number
  bucket: AgeingBucket
  days: number
}

export type DeadStockRow = {
  id: string
  sku: string
  name: string
  brand: string
  warehouse: string
  qty: number
  value: number
  daysIdle: number
  recommendedAction: DeadStockAction
}

export type InventoryKpis = {
  totalValue: number
  fastMovingSkus: number
  slowMovingSkus: number
  byWarehouse: NamedMetric[]
}

export type InboundKpis = {
  itemsReceived: number
  avgReceivingMins: number
  supplierAccuracyPct: number
  supplierPerf: NamedMetric[]
}

export type OutboundKpis = {
  dispatched: number
  inTransit: number
  failed: number
  pickingAccuracyPct: number
  courierPerf: NamedMetric[]
}

export type OrderKpis = {
  daily: number
  pending: number
  completed: number
  cancelled: number
  returns: number
  rto: number
  byBrand: NamedMetric[]
  byChannel: NamedMetric[]
  peakHours: NamedMetric[]
}

export const INVENTORY_KIND_LABELS: Record<InventoryReportKind, string> = {
  current_stock: 'Current stock',
  movement: 'Stock movement',
  valuation: 'Valuation',
  low_stock: 'Low stock',
  overstock: 'Overstock',
  batch: 'Batch-wise',
  serial: 'Serial numbers',
  expiry: 'Expiry',
}

export const ORDER_STATUS_LABELS: Record<OrderReportStatus, string> = {
  daily: 'Daily',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
  return: 'Return',
  rto: 'RTO',
}

export const ACTIVITY_TYPE_LABELS: Record<UserActivityType, string> = {
  login: 'Login',
  inventory: 'Inventory',
  order: 'Order processing',
  scan: 'Barcode scan',
  adjustment: 'Manual adjustment',
  approval: 'Approval',
}

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  xlsx: 'Excel (.xlsx)',
  csv: 'CSV',
  pdf: 'PDF',
  json: 'JSON',
}

export const SLA_AREA_LABELS: Record<SlaArea, string> = {
  receiving: 'Receiving SLA',
  putaway: 'Put Away SLA',
  picking: 'Picking SLA',
  packing: 'Packing SLA',
  dispatch: 'Dispatch SLA',
  delivery: 'Delivery SLA',
}

export const AGEING_BUCKET_LABELS: Record<AgeingBucket, string> = {
  '0-30': '0–30 days',
  '31-90': '31–90 days',
  '91-180': '91–180 days',
  '180+': '180+ days',
}

export const DEAD_STOCK_ACTION_LABELS: Record<DeadStockAction, string> = {
  promotion: 'Promotion',
  liquidation: 'Liquidation',
  return_supplier: 'Return to supplier',
  scrap: 'Scrap',
  bundle: 'Bundle offer',
}

export const REPORT_WAREHOUSES = ['All warehouses', 'BLR-01', 'DEL-02', 'MUM-03'] as const
