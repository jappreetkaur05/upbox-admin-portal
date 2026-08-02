import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useOrderReport } from '@/hooks/useReportsAdmin'
import { reportsAdminService } from '@/services/reportsAdmin.service'
import { ORDER_STATUS_LABELS, type OrderReportStatus } from '@/types/reportsAdmin'
import { formatMoney } from '@/lib/cn'
import { ReportFiltersBar, type ReportFiltersValue } from './ReportFiltersBar'

export function OrderReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    dateRange: 'today',
    warehouse: 'All warehouses',
  })
  const [status, setStatus] = useState<OrderReportStatus | 'all'>('all')
  const q = useOrderReport(filters.warehouse)
  const kpis = reportsAdminService.orderKpis()
  const maxBrand = Math.max(1, ...kpis.byBrand.map((b) => b.value))
  const maxChannel = Math.max(1, ...kpis.byChannel.map((c) => c.value))

  const rows = useMemo(() => {
    if (status === 'all') return q.data ?? []
    return (q.data ?? []).filter((r) => r.status === status)
  }, [q.data, status])

  return (
    <div>
      <PageHeader
        title="Order Reports"
        description="Daily, pending, completed, cancelled, return, and RTO orders with channel analytics."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            ['Daily', kpis.daily],
            ['Pending', kpis.pending],
            ['Completed', kpis.completed],
            ['Cancelled', kpis.cancelled],
            ['Returns', kpis.returns],
            ['RTO', kpis.rto],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="surface-panel p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 font-heading text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <ReportFiltersBar value={filters} onChange={setFilters} />

      <div className="mb-3">
        <select
          className="surface-input"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderReportStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {(Object.keys(ORDER_STATUS_LABELS) as OrderReportStatus[]).map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section className="surface-panel overflow-hidden">
          {q.isLoading ? <LoadingPanel label="Loading orders…" /> : null}
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.orderId}</td>
                    <td className="px-4 py-3">{r.brand}</td>
                    <td className="px-4 py-3">{r.channel}</td>
                    <td className="px-4 py-3">{ORDER_STATUS_LABELS[r.status]}</td>
                    <td className="px-4 py-3 text-slate-600">{r.warehouse}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatMoney(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-4">
          <section className="surface-panel p-4">
            <h2 className="font-heading text-base font-semibold">Orders by brand</h2>
            <ul className="mt-3 space-y-2">
              {kpis.byBrand.map((b) => (
                <li key={b.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{b.label}</span>
                    <span className="font-semibold">{b.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-sky-500"
                      style={{ width: `${(b.value / maxBrand) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="surface-panel p-4">
            <h2 className="font-heading text-base font-semibold">Orders by channel</h2>
            <ul className="mt-3 space-y-2">
              {kpis.byChannel.map((c) => (
                <li key={c.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{c.label}</span>
                    <span className="font-semibold">{c.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(c.value / maxChannel) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="surface-panel p-4">
            <h2 className="font-heading text-base font-semibold">Peak order hours</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {kpis.peakHours.map((h, i) => (
                <li key={h.label} className="flex justify-between">
                  <span className="text-slate-600">
                    #{i + 1} · {h.label}
                  </span>
                  <span className="font-semibold">{h.value} orders</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}
