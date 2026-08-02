import {
  ageingRows,
  deadStockRows,
  exportJobs,
  financialSnapshot,
  inboundKpis,
  inboundRows,
  inventoryKpis,
  inventoryRows,
  kpiDashboardSnapshot,
  orderKpis,
  orderRows,
  outboundKpis,
  outboundRows,
  slaMetrics,
  userActivityEvents,
  warehousePerfSnapshot,
} from '@/data/mockReportsAdmin'
import type {
  AgeingBucketRow,
  DeadStockRow,
  ExportFormat,
  ExportJob,
  FinancialReportSnapshot,
  InboundKpis,
  InboundReportRow,
  InventoryKpis,
  InventoryReportKind,
  InventoryReportRow,
  KpiDashboardSnapshot,
  OrderKpis,
  OrderReportRow,
  OutboundKpis,
  OutboundReportRow,
  SlaMetric,
  UserActivityEvent,
  WarehousePerfSnapshot,
} from '@/types/reportsAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

function matchWarehouse<T extends { warehouse: string }>(rows: T[], warehouse: string): T[] {
  if (!warehouse || warehouse === 'All warehouses') return rows
  return rows.filter((r) => r.warehouse === warehouse)
}

export const reportsAdminService = {
  async listInventory(kind?: InventoryReportKind, warehouse = 'All warehouses'): Promise<InventoryReportRow[]> {
    await delay()
    let rows = [...inventoryRows]
    if (kind) rows = rows.filter((r) => r.kind === kind)
    return matchWarehouse(rows, warehouse)
  },

  inventoryKpis(): InventoryKpis {
    return { ...inventoryKpis, byWarehouse: [...inventoryKpis.byWarehouse] }
  },

  async listInbound(warehouse = 'All warehouses'): Promise<InboundReportRow[]> {
    await delay()
    return matchWarehouse([...inboundRows], warehouse)
  },

  inboundKpis(): InboundKpis {
    return { ...inboundKpis, supplierPerf: [...inboundKpis.supplierPerf] }
  },

  async listOutbound(warehouse = 'All warehouses'): Promise<OutboundReportRow[]> {
    await delay()
    return matchWarehouse([...outboundRows], warehouse)
  },

  outboundKpis(): OutboundKpis {
    return { ...outboundKpis, courierPerf: [...outboundKpis.courierPerf] }
  },

  async listOrders(warehouse = 'All warehouses'): Promise<OrderReportRow[]> {
    await delay()
    return matchWarehouse([...orderRows], warehouse)
  },

  orderKpis(): OrderKpis {
    return {
      ...orderKpis,
      byBrand: [...orderKpis.byBrand],
      byChannel: [...orderKpis.byChannel],
      peakHours: [...orderKpis.peakHours],
    }
  },

  warehousePerf(): WarehousePerfSnapshot {
    return {
      ...warehousePerfSnapshot,
      warehouseRanking: [...warehousePerfSnapshot.warehouseRanking],
      pickTrend: [...warehousePerfSnapshot.pickTrend],
    }
  },

  async listUserActivity(): Promise<UserActivityEvent[]> {
    await delay()
    return [...userActivityEvents]
  },

  financialSnapshot(): FinancialReportSnapshot {
    return { ...financialSnapshot }
  },

  kpiSnapshot(): KpiDashboardSnapshot {
    return { ...kpiDashboardSnapshot }
  },

  async listExportJobs(): Promise<ExportJob[]> {
    await delay()
    return [...exportJobs]
  },

  async createExportJob(input: {
    reportName: string
    format: ExportFormat
    schedule?: string | null
    email?: string | null
  }): Promise<ExportJob> {
    await delay(120)
    const row: ExportJob = {
      id: `ex-${Date.now()}`,
      reportName: input.reportName,
      format: input.format,
      status: input.schedule ? 'scheduled' : 'queued',
      createdAt: new Date().toISOString(),
      schedule: input.schedule ?? null,
      email: input.email ?? null,
    }
    exportJobs.unshift(row)
    return { ...row }
  },

  async markExportReady(id: string): Promise<ExportJob> {
    await delay(80)
    const row = exportJobs.find((j) => j.id === id)
    if (!row) throw new Error('Export job not found')
    row.status = 'ready'
    return { ...row }
  },

  async listSla(warehouse = 'All warehouses'): Promise<SlaMetric[]> {
    await delay()
    if (!warehouse || warehouse === 'All warehouses') return [...slaMetrics]
    return slaMetrics.filter((s) => s.warehouse === warehouse)
  },

  async listAgeing(warehouse = 'All warehouses'): Promise<AgeingBucketRow[]> {
    await delay()
    return matchWarehouse([...ageingRows], warehouse)
  },

  async listDeadStock(warehouse = 'All warehouses'): Promise<DeadStockRow[]> {
    await delay()
    return matchWarehouse([...deadStockRows], warehouse)
  },
}
