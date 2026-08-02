import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useDeadStockReport } from '@/hooks/useReportsAdmin'
import { DEAD_STOCK_ACTION_LABELS } from '@/types/reportsAdmin'
import { formatMoney } from '@/lib/cn'
import { ReportFiltersBar, type ReportFiltersValue } from './ReportFiltersBar'

export function DeadStockPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    dateRange: 'this_month',
    warehouse: 'All warehouses',
    brand: '',
  })
  const q = useDeadStockReport(filters.warehouse)

  const rows = useMemo(() => {
    const brand = (filters.brand ?? '').trim().toLowerCase()
    return (q.data ?? []).filter((r) => !brand || r.brand.toLowerCase().includes(brand))
  }, [q.data, filters.brand])

  const totalValue = rows.reduce((s, r) => s + r.value, 0)

  const byBrand = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rows) map.set(r.brand, (map.get(r.brand) ?? 0) + r.value)
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [rows])

  const byWarehouse = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rows) map.set(r.warehouse, (map.get(r.warehouse) ?? 0) + r.value)
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [rows])

  const maxBrand = Math.max(1, ...byBrand.map((b) => b.value))
  const maxWh = Math.max(1, ...byWarehouse.map((w) => w.value))

  return (
    <div>
      <PageHeader
        title="Dead Stock"
        description="Products with little or no movement — promote, liquidate, return, scrap, or bundle."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Dead stock value
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold text-rose-800">
            {formatMoney(totalValue)}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">SKUs</p>
          <p className="mt-1 font-heading text-2xl font-semibold">{rows.length}</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Total units
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">
            {rows.reduce((s, r) => s + r.qty, 0)}
          </p>
        </div>
      </div>

      <ReportFiltersBar value={filters} onChange={setFilters} showBrand />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-panel overflow-hidden">
          {q.isLoading ? <LoadingPanel label="Loading dead stock…" /> : null}
          <div className="overflow-x-auto">
            <table className="min-w-[880px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-right">Days idle</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.sku}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3">{r.brand}</td>
                    <td className="px-4 py-3 text-slate-600">{r.warehouse}</td>
                    <td className="px-4 py-3 text-right font-semibold">{r.qty}</td>
                    <td className="px-4 py-3 text-right">{formatMoney(r.value)}</td>
                    <td className="px-4 py-3 text-right">{r.daysIdle}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                      {DEAD_STOCK_ACTION_LABELS[r.recommendedAction]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-4">
          <section className="surface-panel p-4">
            <h2 className="font-heading text-base font-semibold">Brand-wise</h2>
            <ul className="mt-3 space-y-2">
              {byBrand.map((b) => (
                <li key={b.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{b.label}</span>
                    <span className="font-semibold">{formatMoney(b.value)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-400"
                      style={{ width: `${(b.value / maxBrand) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="surface-panel p-4">
            <h2 className="font-heading text-base font-semibold">Warehouse-wise</h2>
            <ul className="mt-3 space-y-2">
              {byWarehouse.map((w) => (
                <li key={w.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{w.label}</span>
                    <span className="font-semibold">{formatMoney(w.value)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${(w.value / maxWh) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
