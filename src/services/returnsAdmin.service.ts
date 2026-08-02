import {
  inspections,
  qcResults,
  refunds,
  restockJobs,
  returnDamages,
  returnOrders,
  rtoCases,
} from '@/data/mockReturnsAdmin'
import type {
  InspectionChecks,
  InspectionOutcome,
  QcDisposition,
  QcResult,
  RefundRecord,
  RefundStatus,
  RestockJob,
  ReturnDamage,
  ReturnDamageAction,
  ReturnInspection,
  ReturnOrder,
  ReturnReason,
  ReturnsReportSnapshot,
  RtoCase,
  RtoPipelineStep,
} from '@/types/returnsAdmin'
import { RTO_PIPELINE } from '@/types/returnsAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

function nextReturnId() {
  const n = 240800 + returnOrders.length + 1
  return `RET-${n}`
}

export const returnsAdminService = {
  async listOrders(): Promise<ReturnOrder[]> {
    await delay()
    return [...returnOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async createOrder(input: {
    orderId: string
    customer: string
    sku: string
    name: string
    qty: number
    reason: ReturnReason
  }): Promise<ReturnOrder> {
    await delay(150)
    const returnId = nextReturnId()
    const row: ReturnOrder = {
      id: `ro-${Date.now()}`,
      returnId,
      orderId: input.orderId,
      customer: input.customer,
      lines: [{ sku: input.sku, name: input.name, qty: input.qty }],
      reason: input.reason,
      status: 'requested',
      createdAt: new Date().toISOString(),
      source: 'customer',
    }
    returnOrders.unshift(row)
    inspections.unshift({
      id: `insp-${Date.now()}`,
      returnId,
      checks: {
        correctProduct: false,
        quantity: false,
        packaging: false,
        signsOfUse: false,
        accessories: false,
      },
      outcome: 'pending',
      notes: '',
      inspector: 'Unassigned',
      updatedAt: new Date().toISOString(),
    })
    return { ...row }
  },

  async listInspections(): Promise<ReturnInspection[]> {
    await delay()
    return [...inspections].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  async submitInspection(input: {
    returnId: string
    checks: InspectionChecks
    outcome: InspectionOutcome
    notes: string
  }): Promise<ReturnInspection> {
    await delay(120)
    let row = inspections.find((i) => i.returnId === input.returnId)
    if (!row) {
      row = {
        id: `insp-${Date.now()}`,
        returnId: input.returnId,
        checks: input.checks,
        outcome: input.outcome,
        notes: input.notes,
        inspector: 'Sara Supervisor',
        updatedAt: new Date().toISOString(),
      }
      inspections.unshift(row)
    } else {
      row.checks = input.checks
      row.outcome = input.outcome
      row.notes = input.notes
      row.inspector = 'Sara Supervisor'
      row.updatedAt = new Date().toISOString()
    }

    const order = returnOrders.find((o) => o.returnId === input.returnId)
    if (order) {
      if (input.outcome === 'sent_for_qc') {
        order.status = 'qc'
        for (const line of order.lines) {
          const exists = qcResults.some(
            (q) => q.returnId === order.returnId && q.sku === line.sku && q.disposition === null
          )
          if (!exists) {
            qcResults.unshift({
              id: `qc-${Date.now()}-${line.sku}`,
              returnId: order.returnId,
              sku: line.sku,
              skuName: line.name,
              qty: line.qty,
              disposition: null,
              updatedAt: new Date().toISOString(),
            })
          }
        }
      } else if (input.outcome === 'approved') {
        order.status = 'inspecting'
      } else if (input.outcome === 'rejected') {
        order.status = 'closed'
      } else {
        order.status = 'inspecting'
      }
    }
    return { ...row }
  },

  async listQc(): Promise<QcResult[]> {
    await delay()
    return [...qcResults].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  async setDisposition(id: string, disposition: QcDisposition): Promise<QcResult> {
    await delay(120)
    const row = qcResults.find((q) => q.id === id)
    if (!row) throw new Error('QC line not found')
    row.disposition = disposition
    row.updatedAt = new Date().toISOString()

    const order = returnOrders.find((o) => o.returnId === row.returnId)
    if (disposition === 'sellable') {
      if (order) order.status = 'qc'
      const existing = restockJobs.find((j) => j.returnId === row.returnId && j.sku === row.sku)
      if (!existing) {
        restockJobs.unshift({
          id: `rs-${Date.now()}`,
          returnId: row.returnId,
          sku: row.sku,
          skuName: row.skuName,
          qty: row.qty,
          locationCode: null,
          status: 'pending',
          updatedAt: new Date().toISOString(),
        })
      }
    } else {
      if (order) order.status = 'damaged'
      const existing = returnDamages.find((d) => d.returnId === row.returnId && d.sku === row.sku)
      if (!existing) {
        returnDamages.unshift({
          id: `rd-${Date.now()}`,
          returnId: row.returnId,
          sku: row.sku,
          skuName: row.skuName,
          qty: row.qty,
          action:
            disposition === 'repairable'
              ? 'repair'
              : disposition === 'scrap'
                ? 'scrap'
                : 'dispose',
          notes: `From QC: ${disposition}`,
          updatedAt: new Date().toISOString(),
        })
      }
    }
    return { ...row }
  },

  async listRestock(): Promise<RestockJob[]> {
    await delay()
    return [...restockJobs].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  async completeRestock(id: string, locationCode: string): Promise<RestockJob> {
    await delay(120)
    const row = restockJobs.find((j) => j.id === id)
    if (!row) throw new Error('Restock job not found')
    row.locationCode = locationCode
    row.status = 'restocked'
    row.updatedAt = new Date().toISOString()
    const order = returnOrders.find((o) => o.returnId === row.returnId)
    if (order) order.status = 'restocked'
    return { ...row }
  },

  async listDamages(): Promise<ReturnDamage[]> {
    await delay()
    return [...returnDamages].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  async upsertDamage(
    partial: Omit<ReturnDamage, 'id' | 'updatedAt'> & { id?: string }
  ): Promise<ReturnDamage> {
    await delay(120)
    if (partial.id) {
      const i = returnDamages.findIndex((d) => d.id === partial.id)
      if (i < 0) throw new Error('Damage record not found')
      returnDamages[i] = { ...returnDamages[i], ...partial, id: partial.id }
      return { ...returnDamages[i] }
    }
    const row: ReturnDamage = {
      ...partial,
      id: `rd-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    }
    returnDamages.unshift(row)
    return { ...row }
  },

  async updateDamageAction(id: string, action: ReturnDamageAction): Promise<ReturnDamage> {
    await delay(100)
    const row = returnDamages.find((d) => d.id === id)
    if (!row) throw new Error('Damage record not found')
    row.action = action
    row.updatedAt = new Date().toISOString()
    return { ...row }
  },

  async listRto(): Promise<RtoCase[]> {
    await delay()
    return [...rtoCases].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  },

  async advanceRto(id: string): Promise<RtoCase> {
    await delay(120)
    const row = rtoCases.find((r) => r.id === id)
    if (!row) throw new Error('RTO not found')
    const idx = RTO_PIPELINE.indexOf(row.step)
    if (idx < RTO_PIPELINE.length - 1) {
      row.step = RTO_PIPELINE[idx + 1] as RtoPipelineStep
      row.updatedAt = new Date().toISOString()
    }
    return { ...row }
  },

  async listRefunds(): Promise<RefundRecord[]> {
    await delay()
    return [...refunds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  async updateRefundStatus(id: string, status: RefundStatus): Promise<RefundRecord> {
    await delay(100)
    const row = refunds.find((r) => r.id === id)
    if (!row) throw new Error('Refund not found')
    row.status = status
    if (status === 'completed') {
      const order = returnOrders.find((o) => o.returnId === row.returnId)
      if (order) order.status = 'refunded'
    }
    return { ...row }
  },

  reportSnapshot(): ReturnsReportSnapshot {
    const totalReturns = returnOrders.length
    const outboundApprox = 120
    const rtoCount = rtoCases.length
    const reasonMap = new Map<ReturnReason, number>()
    for (const o of returnOrders) {
      reasonMap.set(o.reason, (reasonMap.get(o.reason) ?? 0) + 1)
    }
    const reasonBreakdown = ([...reasonMap.entries()] as [ReturnReason, number][])
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalReturns,
      returnRatePct: Math.round((totalReturns / outboundApprox) * 1000) / 10,
      rtoRatePct: Math.round((rtoCount / outboundApprox) * 1000) / 10,
      damagedReturns: returnDamages.length,
      refundsPending: refunds.filter((r) => r.status === 'pending' || r.status === 'approved').length,
      refundsCompleted: refunds.filter((r) => r.status === 'completed').length,
      refundTotalCompleted: refunds
        .filter((r) => r.status === 'completed')
        .reduce((s, r) => s + r.amount, 0),
      reasonBreakdown,
    }
  },

  orderByReturnId(returnId: string): ReturnOrder | undefined {
    return returnOrders.find((o) => o.returnId === returnId)
  },
}
