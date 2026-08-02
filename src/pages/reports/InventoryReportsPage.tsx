import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useInventoryReport } from '@/hooks/useReportsAdmin'
import { reportsAdminService } from '@/services/reportsAdmin.service'
import {
  INVENTORY_KIND_LABELS,
  type InventoryReportKind,
} from '@/types/reportsAdmin'
import { formatMoney } from '@/lib/cn'
import { ReportFiltersBar, type ReportFiltersValue } from './ReportFiltersBar'

const KINDS = Object.keys(INVENTORY_KIND_LABELS) as InventoryReportKind[]

export function InventoryReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    dateRange: 'this_month',
    warehouse: 'All warehouses',
    brand: '',
    sku: '',
  })
  const [kind, setKind] = useState<InventoryReportKind>('current_stock')
  const q = useInventoryReport(kind, filters.warehouse)
  const kpis = reportsAdminService.inventoryKpis()
  const maxWh = Math.max(1, ...kpis.byWarehouse.map((w) => w.value))

  const rows = useMemo(() => {
    const brand = (filters.brand ?? '').trim().toLowerCase()
    const sku = (filters.sku ?? '').trim().toLowerCase()
    return (q.data ?? []).filter((r) => {
      if (brand && !r.brand.toLowerCase().includes(brand)) return false
      if (sku && !r.sku.toLowerCase().includes(sku)) return false
      return true
    })
  }, [q.data, filters.brand, filters.sku])

  return (
    <div>
      <PageHeader
        title="Inventory Reports"
        description="Current stock, movement, valuation, low/overstock, batch, serial, and expiry."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Total inventory value
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-slate-900">
            {formatMoney(kpis.totalValue)}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            Fast moving SKUs
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-slate-900">
            {kpis.fastMovingSkus}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
            Slow moving SKUs
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-slate-900">
            {kpis.slowMovingSkus}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Warehouses
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-slate-900">
            {kpis.byWarehouse.length}
          </p>
        </div>
      </div>

      <ReportFiltersBar value={filters} onChange={setFilters} showBrand showSku />

      <div className="mb-3 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
              kind === k
                ? 'bg-sky-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {INVENTORY_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-panel overflow-hidden">
          {q.isLoading ? <LoadingPanel label="Loading inventory…" /> : null}
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.sku}</td>
                    <td className="px-4 py-3 text-slate-700">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.warehouse}</td>
                    <td className="px-4 py-3 text-right font-semibold">{r.qty}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(r.value)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.detail}</td>
                  </tr>
                ))}
                {rows.length === 0 && !q.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No rows for this report type.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Warehouse-wise inventory</h2>
          <ul className="mt-4 space-y-3">
            {kpis.byWarehouse.map((w) => (
              <li key={w.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{w.label}</span>
                  <span className="font-semibold">{formatMoney(w.value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(w.value / maxWh) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
