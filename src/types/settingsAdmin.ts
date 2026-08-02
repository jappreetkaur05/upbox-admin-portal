export type PickingStrategy = 'fifo' | 'fefo' | 'closest' | 'zone'
export type PutawayStrategy = 'empty_bin' | 'same_sku' | 'zone' | 'auto_slot'

export type NotificationEvent =
  | 'low_stock'
  | 'order_received'
  | 'shipment_dispatched'
  | 'return_created'
  | 'failed_delivery'
  | 'payment_received'
  | 'sla_breach'
  | 'backup_completed'

export type NotifyChannel = 'email' | 'sms' | 'in_app' | 'push'

export type TemplateChannel = 'email' | 'sms'

export type ApiSystemKind = 'erp' | 'marketplace' | 'accounting' | 'crm' | 'payment'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error'

export type UomKind = 'count' | 'weight' | 'volume' | 'length'

export type MasterType =
  | 'brand'
  | 'category'
  | 'supplier'
  | 'customer'
  | 'courier'
  | 'warehouse'
  | 'attribute'
  | 'location'

export type BackupType = 'full' | 'incremental' | 'differential'

export type BackupStatus = 'completed' | 'running' | 'failed'

export type SystemLogCategory =
  | 'login'
  | 'config'
  | 'inventory'
  | 'api'
  | 'security'
  | 'failed_login'
  | 'db'

export type CompanyProfile = {
  name: string
  logoUrl: string
  gstin: string
  pan: string
  cin: string
  address: string
  contactEmail: string
  contactPhone: string
  timezone: string
  currency: string
  businessHours: string
  language: string
  dateFormat: string
}

export type WarehouseSetting = {
  id: string
  name: string
  code: string
  defaultLocation: string
  hours: string
  capacity: number
  pickingStrategy: PickingStrategy
  putawayStrategy: PutawayStrategy
  multiWarehouse: boolean
  autoSlotting: boolean
}

export type NotificationChannels = {
  email: boolean
  sms: boolean
  inApp: boolean
  push: boolean
}

export type NotificationRule = {
  id: string
  event: NotificationEvent
  channels: NotifyChannel[]
  enabled: boolean
}

export type MessageTemplate = {
  id: string
  channel: TemplateChannel
  name: string
  subject: string | null
  body: string
  variables: string[]
  language: string
  version: number
}

export type CourierIntegration = {
  id: string
  name: string
  connected: boolean
  apiKeyMasked: string
  services: string[]
  labelPrinting: boolean
  trackingSync: boolean
  pickupEnabled: boolean
}

export type ApiIntegration = {
  id: string
  name: string
  system: ApiSystemKind
  status: IntegrationStatus
}

export type ApiKey = {
  id: string
  name: string
  keyMasked: string
  createdAt: string
  lastUsed: string | null
  rateLimit: number
}

export type Webhook = {
  id: string
  url: string
  events: string[]
  active: boolean
}

export type ApiSecurityConfig = {
  ipWhitelist: string
  defaultRateLimit: number
}

export type TaxCategory = { id: string; name: string; rate: number }

export type HsnSample = { id: string; code: string; description: string; rate: number }

export type TaxSetting = {
  gstActive: boolean
  cgst: number
  sgst: number
  igst: number
  reverseCharge: boolean
  categories: TaxCategory[]
  hsnSamples: HsnSample[]
}

export type UnitOfMeasure = {
  id: string
  code: string
  name: string
  kind: UomKind
  isDefault: boolean
  conversionToBase: number
}

export type MasterRecord = {
  id: string
  type: MasterType
  name: string
  code: string | null
  meta: string
}

export type BackupJob = {
  id: string
  type: BackupType
  status: BackupStatus
  createdAt: string
  encrypted: boolean
  location: string
}

export type SystemLogEntry = {
  id: string
  category: SystemLogCategory
  user: string
  detail: string
  at: string
}

export type SettingsDashboardSnapshot = {
  companyName: string
  warehousesActive: number
  couriersConnected: number
  emailTemplates: number
  smsTemplates: number
  apiIntegrations: number
  gstActive: boolean
  lastBackupLabel: string
  systemHealth: 'healthy' | 'degraded' | 'down'
}

export const NOTIFY_EVENT_LABELS: Record<NotificationEvent, string> = {
  low_stock: 'Low stock',
  order_received: 'Order received',
  shipment_dispatched: 'Shipment dispatched',
  return_created: 'Return created',
  failed_delivery: 'Failed delivery',
  payment_received: 'Payment received',
  sla_breach: 'SLA breach',
  backup_completed: 'Backup completed',
}

export const PICKING_STRATEGY_LABELS: Record<PickingStrategy, string> = {
  fifo: 'FIFO',
  fefo: 'FEFO',
  closest: 'Closest location',
  zone: 'Zone-based',
}

export const PUTAWAY_STRATEGY_LABELS: Record<PutawayStrategy, string> = {
  empty_bin: 'Empty bin',
  same_sku: 'Same SKU',
  zone: 'Zone-based',
  auto_slot: 'Auto slotting',
}

export const MASTER_TYPE_LABELS: Record<MasterType, string> = {
  brand: 'Brands',
  category: 'Categories',
  supplier: 'Suppliers',
  customer: 'Customers',
  courier: 'Couriers',
  warehouse: 'Warehouses',
  attribute: 'Product attributes',
  location: 'Storage locations',
}

export const LOG_CATEGORY_LABELS: Record<SystemLogCategory, string> = {
  login: 'User login',
  config: 'Configuration',
  inventory: 'Inventory',
  api: 'API request',
  security: 'Security',
  failed_login: 'Failed login',
  db: 'Database',
}

export const API_SYSTEM_LABELS: Record<ApiSystemKind, string> = {
  erp: 'ERP',
  marketplace: 'Marketplace',
  accounting: 'Accounting',
  crm: 'CRM',
  payment: 'Payment gateway',
}

export const BACKUP_TYPE_LABELS: Record<BackupType, string> = {
  full: 'Full',
  incremental: 'Incremental',
  differential: 'Differential',
}
