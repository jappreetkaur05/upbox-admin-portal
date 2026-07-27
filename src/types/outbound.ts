export type WorkStream = 'inbound' | 'outbound'
export type WorkerKind = 'DOCK' | 'CARTON' | 'RACK' | 'SUPERVISOR'

export type OutboundOrderStatus =
  | 'OPEN'
  | 'ALLOCATED'
  | 'WAVED'
  | 'PICKING'
  | 'PICKED'
  | 'PACKING'
  | 'PACKED'
  | 'READY'
  | 'IN_ROUTE_BAG'
  | 'ASSIGNED_TO_FE'
  | 'RELEASED_TO_FE'
  | 'LOADED'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'ON_HOLD'
  /** @deprecated kept for old mock rows */
  | 'DISPATCHED'
  | 'IN_TRANSIT'

export type OutboundLineStatus =
  | 'PENDING'
  | 'ALLOCATED'
  | 'PICKED'
  | 'PACKED'
  | 'SHIPPED'
  | 'EXCEPTION'

export type WaveType = 'batch' | 'zone' | 'priority' | 'scheduled'
export type WaveStatus = 'DRAFT' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED'

export type ExceptionType = 'OUT_OF_STOCK' | 'WRONG_ITEM' | 'DAMAGED' | 'MISSING' | 'SHORT_PICK'
export type ExceptionStatus = 'OPEN' | 'REPLACING' | 'RESOLVED' | 'CANCELLED'

export type PickAssignStrategy = 'least_open_lists' | 'round_robin' | 'zone_match'
export type RouteBagStatus = 'OPEN' | 'SEALED' | 'ASSIGNED' | 'RELEASED'
export type FeBayStatus = 'FREE' | 'RESERVED' | 'LOADING' | 'COMPLETE'
export type FeQueueStatus = 'WAITING' | 'CHECKED_IN' | 'LOADING' | 'OUT_FOR_DELIVERY' | 'DONE'
export type CourierCode = 'UPBOX' | 'DELHIVERY' | 'BLUEDART' | 'XPRESSBEES' | 'ECOM' | 'SHADOWFAX'

export interface TimelineEvent {
  id: string
  at: string
  label: string
  detail?: string
  actor?: string
}

export interface OutboundOrderLine {
  id: string
  sku: string
  barcode: string
  name: string
  brandId: string
  qty: number
  qtyAllocated: number
  qtyPicked: number
  qtyPacked: number
  status: OutboundLineStatus
  allocatedLocationCode: string | null
  allocatedBinId: string | null
  unitWeightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

export interface OutboundOrder {
  id: string
  orderNumber: string
  channel: string
  customerName: string
  customerPhone: string
  city: string
  state: string
  pincode: string
  address: string
  status: OutboundOrderStatus
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  slaCutoffAt: string
  createdAt: string
  courier: CourierCode | null
  waveId: string | null
  pickListId: string | null
  packStationId: string | null
  trackingNumber: string | null
  packageType: string | null
  actualWeightKg: number | null
  actualLengthCm: number | null
  actualWidthCm: number | null
  actualHeightCm: number | null
  weightValidated: boolean
  dimsValidated: boolean
  qcPassed: boolean | null
  routeId: string | null
  bagId: string | null
  feId: string | null
  feBayId: string | null
  lines: OutboundOrderLine[]
  timeline: TimelineEvent[]
  valueInr: number
}

export interface PickAssignConfig {
  autoAssignEnabled: boolean
  strategy: PickAssignStrategy
  maxOpenListsPerPicker: number
  preferSameZone: boolean
  splitByZone: boolean
  fallbackToQueue: boolean
}

export interface AllocationRule {
  id: string
  name: string
  enabled: boolean
  strategy: 'FIFO' | 'FEFO' | 'ZONE_NEAREST' | 'LEAST_TOUCH'
  preferredZones: string[]
  description: string
}

export interface Wave {
  id: string
  name: string
  type: WaveType
  status: WaveStatus
  priority: number
  zoneFilter: string | null
  scheduledAt: string | null
  releasedAt: string | null
  orderIds: string[]
  pickerIds: string[]
  createdAt: string
}

export interface PickStop {
  id: string
  orderId: string
  lineId: string
  sku: string
  name: string
  barcode: string
  qty: number
  qtyPicked: number
  locationCode: string
  rack: string
  shelf: string
  bin: string
  sequence: number
  done: boolean
}

export interface PickList {
  id: string
  waveId: string
  pickerId: string | null
  pickerName: string | null
  status: 'QUEUED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETE'
  routeOptimized: boolean
  stops: PickStop[]
  createdAt: string
  zoneHint: string | null
}

export interface PickException {
  id: string
  orderId: string
  orderNumber: string
  lineId: string
  sku: string
  type: ExceptionType
  status: ExceptionStatus
  notes: string
  raisedBy: string
  raisedAt: string
  replacementSku: string | null
}

export interface PackStation {
  id: string
  name: string
  zone: string
  activeOrderId: string | null
  operatorId: string | null
  status: 'IDLE' | 'BUSY' | 'OFFLINE'
}

export interface PackageOption {
  id: string
  name: string
  type: 'MAILER' | 'CARTON' | 'POLYBAG'
  maxWeightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  score: number
}

export interface ShippingLabel {
  id: string
  orderId: string
  orderNumber: string
  trackingNumber: string
  barcode: string
  qrPayload: string
  courier: CourierCode
  printedAt: string | null
  printCount: number
  labelUrl: string
}

export interface DeliveryRoute {
  id: string
  code: string
  name: string
  area: string
  pincodes: string[]
}

export interface RouteBag {
  id: string
  routeId: string
  routeCode: string
  routeName: string
  bagBarcode: string
  orderIds: string[]
  status: RouteBagStatus
  feId: string | null
  feName: string | null
  feBayId: string | null
  sealedAt: string | null
  assignedAt: string | null
  createdAt: string
}

export interface FieldExecutive {
  id: string
  name: string
  phone: string
  employeeId: string
  areas: string[]
  status: 'offline' | 'online' | 'loading' | 'delivering'
  openParcelCount: number
}

export interface FeBay {
  id: string
  code: string
  name: string
  status: FeBayStatus
  feId: string | null
  bagIds: string[]
  utilizationPct: number
}

export interface FeCheckIn {
  id: string
  feId: string
  feName: string
  phone: string
  employeeId: string
  otpVerified: boolean
  verifiedAt: string | null
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

export interface FeQueueItem {
  id: string
  feId: string
  feName: string
  status: FeQueueStatus
  bayId: string | null
  bagCount: number
  parcelCount: number
  capacityParcels: number
  loadedParcels: number
}

export interface InFieldShipment {
  id: string
  orderId: string
  orderNumber: string
  trackingNumber: string
  feId: string
  feName: string
  routeCode: string
  status: 'ASSIGNED' | 'LOADED' | 'DELIVERED' | 'FAILED' | 'RETURNED'
  releasedAt: string
  deliveredAt: string | null
  city: string
  customerPhone: string
  valueInr: number
}

export interface OutboundActivity {
  id: string
  at: string
  message: string
  tone: 'info' | 'success' | 'warn' | 'danger'
}

export interface OutboundDashboardKpis {
  ordersWaiting: number
  ordersAllocated: number
  picking: number
  packing: number
  readyForFe: number
  inRouteBags: number
  assignedToFe: number
  outWithFe: number
  deliveredToday: number
  slaBreaches: number
  exceptionsOpen: number
}

/** Payload written to localStorage for rider app scan catalog merge */
export interface FeHandoffParcel {
  parcelId: string
  orderNumber: string
  feId: string
  feName: string
  routeCode: string
  bagBarcode: string
  customerName: string
  customerPhone: string
  address: string
  city: string
  pincode: string
  trackingNumber: string
  barcode: string
  valueInr: number
  assignedAt: string
}

export const ORDER_STATUS_LABELS: Record<OutboundOrderStatus, string> = {
  OPEN: 'Open',
  ALLOCATED: 'Allocated',
  WAVED: 'In wave',
  PICKING: 'Picking',
  PICKED: 'Picked',
  PACKING: 'Packing',
  PACKED: 'Packed',
  READY: 'Ready for route bag',
  IN_ROUTE_BAG: 'In route bag',
  ASSIGNED_TO_FE: 'Assigned to FE',
  RELEASED_TO_FE: 'Released to FE',
  LOADED: 'Loaded by FE',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RETURNED: 'Returned',
  ON_HOLD: 'On hold',
  DISPATCHED: 'Dispatched (legacy)',
  IN_TRANSIT: 'In transit (legacy)',
}

export const EXCEPTION_LABELS: Record<ExceptionType, string> = {
  OUT_OF_STOCK: 'Out of stock',
  WRONG_ITEM: 'Wrong item',
  DAMAGED: 'Damaged item',
  MISSING: 'Missing inventory',
  SHORT_PICK: 'Short pick',
}

export const COURIER_LABELS: Record<CourierCode, string> = {
  UPBOX: 'Upbox FE',
  DELHIVERY: 'Delhivery',
  BLUEDART: 'Blue Dart',
  XPRESSBEES: 'Xpressbees',
  ECOM: 'Ecom Express',
  SHADOWFAX: 'Shadowfax',
}

export const HANDOFF_STORAGE_KEY = 'upbox-fe-handoff-v1'
