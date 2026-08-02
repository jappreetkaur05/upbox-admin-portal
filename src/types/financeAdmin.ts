export type BillableServiceKind =
  | 'storage'
  | 'picking'
  | 'packing'
  | 'shipping'
  | 'return_processing'
  | 'vas'

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'failed'

export type VendorCategory = 'rent' | 'materials' | 'courier' | 'maintenance'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type StorageMethod = 'pallet' | 'bin' | 'rack' | 'cbm' | 'period'

export type PickPackBillingOption = 'per_order' | 'per_sku' | 'per_item' | 'per_package'

export type PickPackExtra = 'gift_wrap' | 'fragile' | 'custom'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'reissued'

export type PaymentDirection = 'in' | 'out'

export type PaymentMethod = 'upi' | 'bank' | 'card' | 'cash' | 'wallet'

export type CreditNoteReason =
  | 'returned_goods'
  | 'overcharged'
  | 'discount'
  | 'billing_error'

export type ServiceLine = {
  kind: BillableServiceKind
  label: string
  amount: number
}

export type CustomerBill = {
  id: string
  customer: string
  invoiceNumber: string
  period: string
  services: ServiceLine[]
  taxes: number
  total: number
  paymentStatus: PaymentStatus
}

export type VendorBill = {
  id: string
  vendor: string
  invoiceNumber: string
  category: VendorCategory
  amount: number
  dueDate: string
  poNumber: string
  approvalStatus: ApprovalStatus
}

export type WarehouseChargeRate = {
  id: string
  name: string
  unit: string
  rate: number
  active: boolean
}

export type StorageChargeCalc = {
  id: string
  customer: string
  method: StorageMethod
  qty: number
  rate: number
  days: number
  total: number
  createdAt: string
}

export type PickPackCharge = {
  id: string
  customer: string
  period: string
  billingOption: PickPackBillingOption
  qty: number
  rate: number
  extras: PickPackExtra[]
  extrasAmount: number
  total: number
}

export type InvoiceLine = {
  description: string
  amount: number
}

export type Invoice = {
  id: string
  invoiceNumber: string
  customer: string
  period: string
  lines: InvoiceLine[]
  gstPercent: number
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
  createdAt: string
}

export type Payment = {
  id: string
  direction: PaymentDirection
  party: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  dueDate: string
  paidAt: string | null
  ref: string
}

export type CreditNote = {
  id: string
  creditNoteNumber: string
  invoiceNumber: string
  customer: string
  reason: CreditNoteReason
  amount: number
  status: 'draft' | 'issued'
  createdAt: string
}

export type FinanceReportSnapshot = {
  revenue: number
  customerBillingTotal: number
  vendorPaymentsTotal: number
  outstanding: number
  warehouseRevenue: number
  storageRevenue: number
  pickPackRevenue: number
  gstCollected: number
  expenses: number
  profit: number
}

export const SERVICE_KIND_LABELS: Record<BillableServiceKind, string> = {
  storage: 'Storage Charges',
  picking: 'Picking Charges',
  packing: 'Packing Charges',
  shipping: 'Shipping Charges',
  return_processing: 'Return Processing',
  vas: 'Value Added Services',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  partial: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  failed: 'Failed',
}

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  rent: 'Warehouse Rent',
  materials: 'Packaging Materials',
  courier: 'Courier Bills',
  maintenance: 'Equipment Maintenance',
}

export const STORAGE_METHOD_LABELS: Record<StorageMethod, string> = {
  pallet: 'Per Pallet',
  bin: 'Per Bin',
  rack: 'Per Rack',
  cbm: 'Per Cubic Meter',
  period: 'Per Day / Week / Month',
}

export const PICK_PACK_OPTION_LABELS: Record<PickPackBillingOption, string> = {
  per_order: 'Per Order',
  per_sku: 'Per SKU',
  per_item: 'Per Item Picked',
  per_package: 'Per Package',
}

export const PICK_PACK_EXTRA_LABELS: Record<PickPackExtra, string> = {
  gift_wrap: 'Gift Wrapping',
  fragile: 'Fragile Packing',
  custom: 'Custom Packaging',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  cancelled: 'Cancelled',
  reissued: 'Reissued',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: 'UPI',
  bank: 'Bank Transfer',
  card: 'Credit Card',
  cash: 'Cash',
  wallet: 'Wallet',
}

export const CREDIT_REASON_LABELS: Record<CreditNoteReason, string> = {
  returned_goods: 'Returned Goods',
  overcharged: 'Overcharged Customer',
  discount: 'Discount Adjustment',
  billing_error: 'Billing Error',
}
