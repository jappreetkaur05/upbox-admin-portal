export type BarcodeSymbology = 'code128' | 'code39' | 'ean13' | 'upc' | 'gs1_128'

export type BarcodeEntityType = 'sku' | 'product' | 'location' | 'batch' | 'shipment'

export type QrMode = 'static' | 'dynamic'

export type LabelSize = 'small' | 'medium' | 'large'

export type LabelType = 'product' | 'rack' | 'bin' | 'shipment'

export type PrintJobStatus = 'queued' | 'printed' | 'failed'

export type ScanAction =
  | 'goods_received'
  | 'putaway'
  | 'picking'
  | 'packing'
  | 'dispatch'
  | 'audit'

export type ScannerConnection = 'usb' | 'bluetooth' | 'camera'

export type LabelElements = {
  logo: boolean
  productName: boolean
  sku: boolean
  barcode: boolean
  qr: boolean
  batch: boolean
  price: boolean
  dates: boolean
}

export type GeneratedBarcode = {
  id: string
  value: string
  symbology: BarcodeSymbology
  entityType: BarcodeEntityType
  entityRef: string
  createdAt: string
}

export type GeneratedQr = {
  id: string
  payload: string
  mode: QrMode
  entityType: BarcodeEntityType
  entityRef: string
  createdAt: string
}

export type LabelTemplate = {
  id: string
  name: string
  size: LabelSize
  elements: LabelElements
  status: 'active' | 'inactive'
}

export type PrintJob = {
  id: string
  templateId: string
  labelType: LabelType
  targets: string[]
  copies: number
  status: PrintJobStatus
  createdAt: string
  reprintOf: string | null
}

export type ScanHistoryRow = {
  id: string
  at: string
  user: string
  device: string
  code: string
  action: ScanAction
  locationCode: string
}

export type ScannerSettings = {
  deviceName: string
  connection: ScannerConnection
  scanMode: 'single' | 'batch'
  autoScan: boolean
  continuous: boolean
  sound: boolean
  vibration: boolean
  defaultAction: ScanAction
}

export const SYMBOLOGY_LABELS: Record<BarcodeSymbology, string> = {
  code128: 'Code 128',
  code39: 'Code 39',
  ean13: 'EAN-13',
  upc: 'UPC',
  gs1_128: 'GS1-128',
}

export const ENTITY_TYPE_LABELS: Record<BarcodeEntityType, string> = {
  sku: 'SKU',
  product: 'Product',
  location: 'Storage location',
  batch: 'Batch',
  shipment: 'Shipment',
}

export const LABEL_TYPE_LABELS: Record<LabelType, string> = {
  product: 'Product Label',
  rack: 'Rack Label',
  bin: 'Bin Label',
  shipment: 'Shipment Label',
}

export const SCAN_ACTION_LABELS: Record<ScanAction, string> = {
  goods_received: 'Goods Received',
  putaway: 'Put Away',
  picking: 'Picking',
  packing: 'Packing',
  dispatch: 'Dispatch',
  audit: 'Inventory Audit',
}

export const CONNECTION_LABELS: Record<ScannerConnection, string> = {
  usb: 'USB Scanner',
  bluetooth: 'Bluetooth Scanner',
  camera: 'Camera Scanner',
}
