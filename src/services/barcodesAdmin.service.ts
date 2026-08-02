import {
  generatedBarcodes,
  generatedQrs,
  labelTemplates,
  printJobs,
  scanHistory,
  scannerSettings,
} from '@/data/mockBarcodesAdmin'
import type {
  BarcodeEntityType,
  BarcodeSymbology,
  GeneratedBarcode,
  GeneratedQr,
  LabelElements,
  LabelSize,
  LabelTemplate,
  LabelType,
  PrintJob,
  QrMode,
  ScanHistoryRow,
  ScannerSettings,
} from '@/types/barcodesAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

function uniqueBarcodeValue(symbology: BarcodeSymbology, entityRef: string, i: number) {
  if (symbology === 'ean13' || symbology === 'upc') {
    const base = 8901000000000 + (generatedBarcodes.length + i) * 17
    return String(base).slice(0, 13)
  }
  if (symbology === 'gs1_128') return `GS1${Date.now().toString().slice(-8)}${i}`
  return `${entityRef.replace(/[^A-Z0-9]/gi, '').slice(0, 12)}-${Date.now().toString().slice(-4)}${i}`
}

export const barcodesAdminService = {
  async listBarcodes(): Promise<GeneratedBarcode[]> {
    await delay()
    return [...generatedBarcodes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async generateBarcodes(input: {
    symbology: BarcodeSymbology
    entityType: BarcodeEntityType
    entityRef: string
    count: number
  }): Promise<GeneratedBarcode[]> {
    await delay(150)
    const created: GeneratedBarcode[] = []
    const n = Math.max(1, Math.min(20, input.count))
    for (let i = 0; i < n; i++) {
      const row: GeneratedBarcode = {
        id: `bc-${Date.now()}-${i}`,
        value: uniqueBarcodeValue(input.symbology, input.entityRef, i),
        symbology: input.symbology,
        entityType: input.entityType,
        entityRef: input.entityRef,
        createdAt: new Date().toISOString(),
      }
      generatedBarcodes.unshift(row)
      created.push(row)
    }
    return created
  },

  async listQrs(): Promise<GeneratedQr[]> {
    await delay()
    return [...generatedQrs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async generateQrs(input: {
    payload: string
    mode: QrMode
    entityType: BarcodeEntityType
    entityRef: string
    count: number
  }): Promise<GeneratedQr[]> {
    await delay(150)
    const created: GeneratedQr[] = []
    const n = Math.max(1, Math.min(20, input.count))
    for (let i = 0; i < n; i++) {
      const payload = n === 1 ? input.payload : `${input.payload}|n=${i + 1}`
      const row: GeneratedQr = {
        id: `qr-${Date.now()}-${i}`,
        payload,
        mode: input.mode,
        entityType: input.entityType,
        entityRef: input.entityRef,
        createdAt: new Date().toISOString(),
      }
      generatedQrs.unshift(row)
      created.push(row)
    }
    return created
  },

  async listTemplates(): Promise<LabelTemplate[]> {
    await delay()
    return [...labelTemplates]
  },

  async upsertTemplate(
    partial: Omit<LabelTemplate, 'id'> & { id?: string }
  ): Promise<LabelTemplate> {
    await delay(120)
    if (partial.id) {
      const i = labelTemplates.findIndex((t) => t.id === partial.id)
      if (i < 0) throw new Error('Template not found')
      labelTemplates[i] = { ...labelTemplates[i], ...partial, id: partial.id }
      return { ...labelTemplates[i] }
    }
    const row: LabelTemplate = { ...partial, id: `tpl-${Date.now()}` }
    labelTemplates.unshift(row)
    return { ...row }
  },

  async listPrintJobs(): Promise<PrintJob[]> {
    await delay()
    return [...printJobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async createPrintJob(input: {
    templateId: string
    labelType: LabelType
    targets: string[]
    copies: number
  }): Promise<PrintJob> {
    await delay(150)
    const row: PrintJob = {
      id: `pj-${Date.now()}`,
      templateId: input.templateId,
      labelType: input.labelType,
      targets: input.targets,
      copies: input.copies,
      status: 'queued',
      createdAt: new Date().toISOString(),
      reprintOf: null,
    }
    printJobs.unshift(row)
    return { ...row }
  },

  async markPrinted(id: string): Promise<PrintJob> {
    await delay(100)
    const row = printJobs.find((p) => p.id === id)
    if (!row) throw new Error('Print job not found')
    row.status = 'printed'
    return { ...row }
  },

  async reprint(id: string): Promise<PrintJob> {
    await delay(120)
    const src = printJobs.find((p) => p.id === id)
    if (!src) throw new Error('Print job not found')
    const row: PrintJob = {
      id: `pj-${Date.now()}`,
      templateId: src.templateId,
      labelType: src.labelType,
      targets: [...src.targets],
      copies: src.copies,
      status: 'queued',
      createdAt: new Date().toISOString(),
      reprintOf: src.id,
    }
    printJobs.unshift(row)
    return { ...row }
  },

  async listScanHistory(): Promise<ScanHistoryRow[]> {
    await delay()
    return [...scanHistory].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  },

  async getScannerSettings(): Promise<ScannerSettings> {
    await delay()
    return { ...scannerSettings }
  },

  async saveScannerSettings(next: ScannerSettings): Promise<ScannerSettings> {
    await delay(120)
    Object.assign(scannerSettings, next)
    return { ...scannerSettings }
  },

  templateName(id: string) {
    return labelTemplates.find((t) => t.id === id)?.name ?? id
  },
}

export type { LabelElements, LabelSize }
