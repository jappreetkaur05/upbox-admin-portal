export type ReturnReason =
  | 'wrong_item'
  | 'damaged'
  | 'defective'
  | 'size_mismatch'
  | 'changed_mind'

export type ReturnOrderStatus =
  | 'requested'
  | 'received'
  | 'inspecting'
  | 'qc'
  | 'restocked'
  | 'damaged'
  | 'refunded'
  | 'closed'

export type ReturnLine = {
  sku: string
  name: string
  qty: number
}

export type ReturnOrder = {
  id: string
  returnId: string
  orderId: string
  customer: string
  lines: ReturnLine[]
  reason: ReturnReason
  status: ReturnOrderStatus
  createdAt: string
  source: 'customer' | 'rto'
}

export type InspectionChecks = {
  correctProduct: boolean
  quantity: boolean
  packaging: boolean
  signsOfUse: boolean
  accessories: boolean
}

export type InspectionOutcome = 'approved' | 'rejected' | 'sent_for_qc' | 'pending'

export type ReturnInspection = {
  id: string
  returnId: string
  checks: InspectionChecks
  outcome: InspectionOutcome
  notes: string
  inspector: string
  updatedAt: string
}

export type QcDisposition = 'sellable' | 'repairable' | 'damaged' | 'scrap'

export type QcResult = {
  id: string
  returnId: string
  sku: string
  skuName: string
  qty: number
  disposition: QcDisposition | null
  updatedAt: string
}

export type RestockJobStatus = 'pending' | 'approved' | 'restocked'

export type RestockJob = {
  id: string
  returnId: string
  sku: string
  skuName: string
  qty: number
  locationCode: string | null
  status: RestockJobStatus
  updatedAt: string
}

export type ReturnDamageAction =
  | 'repair'
  | 'return_to_supplier'
  | 'scrap'
  | 'dispose'
  | 'insurance_claim'

export type ReturnDamage = {
  id: string
  returnId: string
  sku: string
  skuName: string
  qty: number
  action: ReturnDamageAction
  notes: string
  updatedAt: string
}

export type RtoReason =
  | 'customer_unavailable'
  | 'wrong_address'
  | 'refused_delivery'
  | 'delivery_failed'

export type RtoPipelineStep =
  | 'shipped'
  | 'delivery_failed'
  | 'returned_to_wh'
  | 'inspection_qc'
  | 'restock_or_damage'
  | 'closed'

export type RtoCase = {
  id: string
  rtoId: string
  orderId: string
  customer: string
  reason: RtoReason
  step: RtoPipelineStep
  linkedReturnId: string | null
  updatedAt: string
}

export type RefundStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'

export type RefundRecord = {
  id: string
  returnId: string
  amount: number
  method: 'upi' | 'card' | 'wallet' | 'bank'
  date: string
  referenceId: string
  status: RefundStatus
}

export type ReturnsReportSnapshot = {
  totalReturns: number
  returnRatePct: number
  rtoRatePct: number
  damagedReturns: number
  refundsPending: number
  refundsCompleted: number
  refundTotalCompleted: number
  reasonBreakdown: { reason: ReturnReason; count: number }[]
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  wrong_item: 'Wrong item received',
  damaged: 'Damaged product',
  defective: 'Defective product',
  size_mismatch: 'Size mismatch',
  changed_mind: 'Customer changed mind',
}

export const RETURN_STATUS_LABELS: Record<ReturnOrderStatus, string> = {
  requested: 'Requested',
  received: 'Received',
  inspecting: 'Inspecting',
  qc: 'QC',
  restocked: 'Restocked',
  damaged: 'Damaged',
  refunded: 'Refunded',
  closed: 'Closed',
}

export const INSPECTION_OUTCOME_LABELS: Record<InspectionOutcome, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  sent_for_qc: 'Sent for QC',
}

export const QC_DISPOSITION_LABELS: Record<QcDisposition, string> = {
  sellable: 'Sellable',
  repairable: 'Repairable',
  damaged: 'Damaged',
  scrap: 'Scrap',
}

export const RETURN_DAMAGE_ACTION_LABELS: Record<ReturnDamageAction, string> = {
  repair: 'Repair',
  return_to_supplier: 'Return to Supplier',
  scrap: 'Scrap',
  dispose: 'Dispose',
  insurance_claim: 'Insurance Claim',
}

export const RTO_REASON_LABELS: Record<RtoReason, string> = {
  customer_unavailable: 'Customer unavailable',
  wrong_address: 'Wrong address',
  refused_delivery: 'Refused delivery',
  delivery_failed: 'Delivery failed',
}

export const RTO_STEP_LABELS: Record<RtoPipelineStep, string> = {
  shipped: 'Order Shipped',
  delivery_failed: 'Delivery Failed',
  returned_to_wh: 'Returned to Warehouse',
  inspection_qc: 'Inspection & QC',
  restock_or_damage: 'Restock or Damage',
  closed: 'Closed',
}

export const RTO_PIPELINE: RtoPipelineStep[] = [
  'shipped',
  'delivery_failed',
  'returned_to_wh',
  'inspection_qc',
  'restock_or_damage',
  'closed',
]

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected',
}
