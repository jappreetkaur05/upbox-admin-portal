import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useOutboundReport } from '@/hooks/useReportsAdmin'
import { reportsAdminService } from '@/services/reportsAdmin.service'
import { ReportFiltersBar, type ReportFiltersValue } from './ReportFiltersBar'

const STATUS_TONE: Record<string, string> = {
  dispatched: 'bg-sky-50 text-sky-800',
  in_transit: 'bg-amber-50 text-amber-800',
  delivered: 'bg-emerald-50 text-emerald-800',
  failed: 'bg-rose-50 text-rose-800',
}

export function OutboundReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    dateRange: 'this_month',
    warehouse: 'All warehouses',
  })
  const q = useOutboundReport(filters.warehouse)
  const kpis = reportsAdminService.outboundKpis()
  const maxCourier = Math.max(1, ...kpis.courierPerf.map((c) => c.value))

  return (
    <div>
      <PageHeader
        title="Outbound Reports"
        description="Dispatch summary, courier performance, shipment status, and pick & pack accuracy."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Orders dispatched
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{kpis.dispatched}</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">
            In transit
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{kpis.inTransit}</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">
            Failed deliveries
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{kpis.failed}</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            Picking accuracy
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{kpis.pickingAccuracyPct}%</p>
        </div>
      </div>

      <ReportFiltersBar value={filters} onChange={setFilters} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="surface-panel overflow-hidden">
          {q.isLoading ? <LoadingPanel label="Loading outbound…" /> : null}
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Shipment</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Courier</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Pick %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(q.data ?? []).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.shipmentId}</td>
                    <td className="px-4 py-3 text-slate-600">{r.orderId}</td>
                    <td className="px-4 py-3">{r.courier}</td>
                    <td className="px-4 py-3">{r.warehouse}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                          STATUS_TONE[r.status]
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{r.pickAccuracyPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Courier performance</h2>
          <ul className="mt-4 space-y-3">
            {kpis.courierPerf.map((c) => (
              <li key={c.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{c.label}</span>
                  <span className="font-semibold">{c.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(c.value / maxCourier) * 100}%` }}
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
