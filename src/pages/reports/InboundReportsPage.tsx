import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useInboundReport } from '@/hooks/useReportsAdmin'
import { reportsAdminService } from '@/services/reportsAdmin.service'
import { ReportFiltersBar, type ReportFiltersValue } from './ReportFiltersBar'

export function InboundReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    dateRange: 'this_month',
    warehouse: 'All warehouses',
  })
  const q = useInboundReport(filters.warehouse)
  const kpis = reportsAdminService.inboundKpis()
  const maxPerf = Math.max(1, ...kpis.supplierPerf.map((s) => s.value))

  return (
    <div>
      <PageHeader
        title="Inbound Reports"
        description="Goods receipt, supplier performance, PO fulfillment, receiving and putaway."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Items received
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{kpis.itemsReceived}</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Avg receiving time
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{kpis.avgReceivingMins}m</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            Supplier delivery accuracy
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{kpis.supplierAccuracyPct}%</p>
        </div>
      </div>

      <ReportFiltersBar value={filters} onChange={setFilters} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-panel overflow-hidden">
          {q.isLoading ? <LoadingPanel label="Loading inbound…" /> : null}
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">GRN</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">PO</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3 text-right">Items</th>
                  <th className="px-4 py-3 text-right">Recv</th>
                  <th className="px-4 py-3 text-right">Putaway</th>
                  <th className="px-4 py-3">On time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(q.data ?? []).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.grn}</td>
                    <td className="px-4 py-3">{r.supplier}</td>
                    <td className="px-4 py-3 text-slate-600">{r.poNumber}</td>
                    <td className="px-4 py-3">{r.warehouse}</td>
                    <td className="px-4 py-3 text-right font-semibold">{r.itemsReceived}</td>
                    <td className="px-4 py-3 text-right">{r.receivingMins}m</td>
                    <td className="px-4 py-3 text-right">{r.putawayMins}m</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          r.onTime
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {r.onTime ? 'Yes' : 'Late'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Supplier performance</h2>
          <p className="mt-0.5 text-xs text-slate-500">On-time delivery score</p>
          <ul className="mt-4 space-y-3">
            {kpis.supplierPerf.map((s) => (
              <li key={s.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{s.label}</span>
                  <span className="font-semibold">{s.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(s.value / maxPerf) * 100}%` }}
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
