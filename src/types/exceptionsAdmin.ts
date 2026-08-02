export type ExceptionType =
  | 'inventory_mismatch'
  | 'damaged_sku'
  | 'wrong_scan'
  | 'courier_rejection'
  | 'failed_dispatch'

export type ExceptionStatus =
  | 'open'
  | 'assigned'
  | 'investigating'
  | 'pending_approval'
  | 'closed'

export type ResolutionStep =
  | 'detected'
  | 'assigned'
  | 'investigation'
  | 'corrective_action'
  | 'manager_approval'
  | 'closed'

export type MismatchCause =
  | 'incorrect_entry'
  | 'picking_mistake'
  | 'lost_item'
  | 'theft'
  | 'scanning_error'

export type DamagedSkuReason =
  | 'broken'
  | 'expired'
  | 'packaging_damaged'
  | 'water_damage'
  | 'manufacturing_defect'

export type DamagedSkuAction = 'repair' | 'scrap' | 'return_supplier' | 'insurance'

export type WrongScanType =
  | 'wrong_sku'
  | 'duplicate'
  | 'invalid'
  | 'unknown'
  | 'wrong_location'

export type CourierRejectReason = 'packaging' | 'missing_label' | 'weight_mismatch' | 'address'

export type FailedDispatchReason =
  | 'stock_unavailable'
  | 'payment_issue'
  | 'courier_unavailable'
  | 'wrong_packaging'
  | 'missing_documents'

export type AttachmentKind = 'photo' | 'invoice' | 'report' | 'courier_doc'

export type InventoryMismatchPayload = {
  sku: string
  skuName: string
  expectedQty: number
  actualQty: number
  difference: number
  cause: MismatchCause
}

export type DamagedSkuPayload = {
  sku: string
  skuName: string
  qty: number
  reason: DamagedSkuReason
  action: DamagedSkuAction
}

export type WrongScanPayload = {
  scanType: WrongScanType
  scannedValue: string
  expectedValue: string
  locationCode: string
  worker: string
}

export type CourierRejectionPayload = {
  shipmentId: string
  orderId: string
  courier: string
  reason: CourierRejectReason
}

export type FailedDispatchPayload = {
  orderId: string
  reason: FailedDispatchReason
}

export type ExceptionCase = {
  id: string
  exceptionId: string
  type: ExceptionType
  title: string
  status: ExceptionStatus
  step: ResolutionStep
  assignee: string | null
  createdAt: string
  correctiveAction: string | null
  approvedBy: string | null
  mismatch?: InventoryMismatchPayload
  damaged?: DamagedSkuPayload
  wrongScan?: WrongScanPayload
  courier?: CourierRejectionPayload
  failedDispatch?: FailedDispatchPayload
}

export type ExceptionComment = {
  id: string
  exceptionId: string
  author: string
  body: string
  at: string
}

export type ExceptionAttachment = {
  id: string
  exceptionId: string
  name: string
  kind: AttachmentKind
  url: string
  at: string
}

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  inventory_mismatch: 'Inventory Mismatch',
  damaged_sku: 'Damaged SKU',
  wrong_scan: 'Wrong Scan',
  courier_rejection: 'Courier Rejection',
  failed_dispatch: 'Failed Dispatch',
}

export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  investigating: 'Investigating',
  pending_approval: 'Pending approval',
  closed: 'Closed',
}

export const RESOLUTION_STEP_LABELS: Record<ResolutionStep, string> = {
  detected: 'Exception Detected',
  assigned: 'Assign Owner',
  investigation: 'Investigation',
  corrective_action: 'Corrective Action',
  manager_approval: 'Manager Approval',
  closed: 'Close Exception',
}

export const RESOLUTION_PIPELINE: ResolutionStep[] = [
  'detected',
  'assigned',
  'investigation',
  'corrective_action',
  'manager_approval',
  'closed',
]

export const MISMATCH_CAUSE_LABELS: Record<MismatchCause, string> = {
  incorrect_entry: 'Incorrect stock entry',
  picking_mistake: 'Picking mistake',
  lost_item: 'Lost item',
  theft: 'Theft',
  scanning_error: 'Scanning error',
}

export const DAMAGED_REASON_LABELS: Record<DamagedSkuReason, string> = {
  broken: 'Broken',
  expired: 'Expired',
  packaging_damaged: 'Packaging damaged',
  water_damage: 'Water damage',
  manufacturing_defect: 'Manufacturing defect',
}

export const DAMAGED_ACTION_LABELS: Record<DamagedSkuAction, string> = {
  repair: 'Repair',
  scrap: 'Scrap',
  return_supplier: 'Return to Supplier',
  insurance: 'Insurance Claim',
}

export const WRONG_SCAN_LABELS: Record<WrongScanType, string> = {
  wrong_sku: 'Wrong SKU',
  duplicate: 'Duplicate Scan',
  invalid: 'Invalid Barcode',
  unknown: 'Unknown Barcode',
  wrong_location: 'Wrong Location',
}

export const COURIER_REASON_LABELS: Record<CourierRejectReason, string> = {
  packaging: 'Packaging issue',
  missing_label: 'Missing label',
  weight_mismatch: 'Weight mismatch',
  address: 'Address issue',
}

export const FAILED_DISPATCH_LABELS: Record<FailedDispatchReason, string> = {
  stock_unavailable: 'Stock unavailable',
  payment_issue: 'Payment issue',
  courier_unavailable: 'Courier unavailable',
  wrong_packaging: 'Wrong packaging',
  missing_documents: 'Missing documents',
}

export const ATTACHMENT_KIND_LABELS: Record<AttachmentKind, string> = {
  photo: 'Photo',
  invoice: 'Invoice',
  report: 'Report',
  courier_doc: 'Courier document',
}
