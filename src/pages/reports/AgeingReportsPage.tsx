import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useAgeingReport } from '@/hooks/useReportsAdmin'
import { AGEING_BUCKET_LABELS, type AgeingBucket } from '@/types/reportsAdmin'
import { formatMoney } from '@/lib/cn'
import { ReportFiltersBar, type ReportFiltersValue } from './ReportFiltersBar'

const BUCKET_TONE: Record<AgeingBucket, string> = {
  '0-30': 'bg-emerald-50 text-emerald-800',
  '31-90': 'bg-amber-50 text-amber-800',
  '91-180': 'bg-orange-50 text-orange-800',
  '180+': 'bg-rose-50 text-rose-800',
}

export function AgeingReportsPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    dateRange: 'this_month',
    warehouse: 'All warehouses',
    brand: '',
  })
  const q = useAgeingReport(filters.warehouse)

  const rows = useMemo(() => {
    const brand = (filters.brand ?? '').trim().toLowerCase()
    return (q.data ?? []).filter((r) => !brand || r.brand.toLowerCase().includes(brand))
  }, [q.data, filters.brand])

  const buckets = useMemo(() => {
    const order: AgeingBucket[] = ['0-30', '31-90', '91-180', '180+']
    return order.map((b) => {
      const subset = rows.filter((r) => r.bucket === b)
      return {
        bucket: b,
        qty: subset.reduce((s, r) => s + r.qty, 0),
        value: subset.reduce((s, r) => s + r.value, 0),
        count: subset.length,
      }
    })
  }, [rows])

  const maxValue = Math.max(1, ...buckets.map((b) => b.value))

  return (
    <div>
      <PageHeader
        title="Inventory Ageing"
        description="How long inventory has been stored — reduce cost and spot obsolete stock."
      />

      <ReportFiltersBar value={filters} onChange={setFilters} showBrand />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {buckets.map((b) => (
          <div key={b.bucket} className="surface-panel p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {AGEING_BUCKET_LABELS[b.bucket]}
            </p>
            <p className="mt-1 font-heading text-xl font-semibold">{formatMoney(b.value)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {b.count} SKUs · {b.qty} units
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${(b.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading ageing…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Bucket</th>
                <th className="px-4 py-3 text-right">Days</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{r.sku}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.brand}</td>
                  <td className="px-4 py-3 text-slate-600">{r.warehouse}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        BUCKET_TONE[r.bucket]
                      }`}
                    >
                      {AGEING_BUCKET_LABELS[r.bucket]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{r.days}</td>
                  <td className="px-4 py-3 text-right font-semibold">{r.qty}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
