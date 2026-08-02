import {
  adjustments,
  audits,
  batches,
  cycleCounts,
  damagedRecords,
  products,
  serials,
  skuMasters,
} from '@/data/mockInventoryAdmin'
import type {
  AdjustmentReason,
  BatchLot,
  CycleCountPlan,
  DamagedRecord,
  InventoryAdjustment,
  InventoryAudit,
  ProductMaster,
  SerialUnit,
  SkuMasterRow,
} from '@/types/inventoryAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

export const inventoryAdminService = {
  async listProducts(): Promise<ProductMaster[]> {
    await delay()
    return [...products]
  },

  async upsertProduct( partial: Omit<ProductMaster, 'id'> & { id?: string }): Promise<ProductMaster> {
    await delay(120)
    if (partial.id) {
      const i = products.findIndex((p) => p.id === partial.id)
      if (i < 0) throw new Error('Product not found')
      products[i] = { ...products[i], ...partial, id: partial.id }
      return { ...products[i] }
    }
    const row: ProductMaster = { ...partial, id: `prod-${Date.now()}` }
    products.push(row)
    return { ...row }
  },

  async listSkuMasters(): Promise<SkuMasterRow[]> {
    await delay()
    return [...skuMasters]
  },

  async upsertSkuMaster(partial: Omit<SkuMasterRow, 'id'> & { id?: string }): Promise<SkuMasterRow> {
    await delay(120)
    if (partial.id) {
      const i = skuMasters.findIndex((s) => s.id === partial.id)
      if (i < 0) throw new Error('SKU not found')
      skuMasters[i] = { ...skuMasters[i], ...partial, id: partial.id }
      return { ...skuMasters[i] }
    }
    const row: SkuMasterRow = { ...partial, id: `sm-${Date.now()}` }
    skuMasters.push(row)
    return { ...row }
  },

  skusForProduct(productId: string): SkuMasterRow[] {
    return skuMasters.filter((s) => s.productId === productId)
  },

  async listBatches(): Promise<BatchLot[]> {
    await delay()
    return [...batches]
  },

  async listSerials(): Promise<SerialUnit[]> {
    await delay()
    return [...serials]
  },

  async listAdjustments(): Promise<InventoryAdjustment[]> {
    await delay()
    return [...adjustments].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  },

  async createAdjustment(input: {
    sku: string
    skuName: string
    beforeQty: number
    afterQty: number
    reason: AdjustmentReason
    notes: string
  }): Promise<InventoryAdjustment> {
    await delay(150)
    const row: InventoryAdjustment = {
      id: `adj-${Date.now()}`,
      sku: input.sku,
      skuName: input.skuName,
      beforeQty: input.beforeQty,
      afterQty: input.afterQty,
      delta: input.afterQty - input.beforeQty,
      reason: input.reason,
      notes: input.notes,
      userName: 'Sara Supervisor',
      at: new Date().toISOString(),
    }
    adjustments.unshift(row)
    return { ...row }
  },

  async listDamaged(): Promise<DamagedRecord[]> {
    await delay()
    return [...damagedRecords]
  },

  async upsertDamaged(
    partial: Omit<DamagedRecord, 'id' | 'at'> & { id?: string }
  ): Promise<DamagedRecord> {
    await delay(120)
    if (partial.id) {
      const i = damagedRecords.findIndex((d) => d.id === partial.id)
      if (i < 0) throw new Error('Record not found')
      damagedRecords[i] = { ...damagedRecords[i], ...partial, id: partial.id }
      return { ...damagedRecords[i] }
    }
    const row: DamagedRecord = {
      ...partial,
      id: `dmg-${Date.now()}`,
      at: new Date().toISOString(),
    }
    damagedRecords.unshift(row)
    return { ...row }
  },

  async listAudits(): Promise<InventoryAudit[]> {
    await delay()
    return [...audits]
  },

  async updateAuditLine(auditId: string, sku: string, actualQty: number): Promise<InventoryAudit> {
    await delay(100)
    const a = audits.find((x) => x.id === auditId)
    if (!a) throw new Error('Audit not found')
    const line = a.lines.find((l) => l.sku === sku)
    if (!line) throw new Error('Line not found')
    line.actualQty = actualQty
    if (a.status === 'open') a.status = 'in_progress'
    return structuredClone(a)
  },

  async listCycleCounts(): Promise<CycleCountPlan[]> {
    await delay()
    return [...cycleCounts]
  },

  async recordCycleCount(id: string, actualQty: number): Promise<CycleCountPlan> {
    await delay(100)
    const row = cycleCounts.find((c) => c.id === id)
    if (!row) throw new Error('Cycle count not found')
    row.actualQty = actualQty
    row.status = 'done'
    return { ...row }
  },

  dashboardSnapshot() {
    const productCount = products.length
    const skuCount = skuMasters.length
    const damagedQty = damagedRecords.reduce((s, d) => s + d.qty, 0)
    const expiringSoon = batches.filter((b) => {
      const days = (new Date(b.expiresAt).getTime() - Date.now()) / 86400_000
      return days <= 30 && days >= 0
    }).length
    return { productCount, skuCount, damagedQty, expiringSoon, batchCount: batches.length }
  },
}
