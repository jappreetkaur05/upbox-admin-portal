import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useBatches } from '@/hooks/useInventoryAdmin'
import { cn } from '@/lib/cn'

export function ExpiryManagementPage() {
  const batchesQ = useBatches()

  const rows = useMemo(() => {
    return [...(batchesQ.data ?? [])]
      .map((b) => {
        const days = Math.ceil((new Date(b.expiresAt).getTime() - Date.now()) / 86400_000)
        return { ...b, days }
      })
      .sort((a, b) => a.days - b.days)
  }, [batchesQ.data])

  const alerts = rows.filter((r) => r.days <= 30)

  return (
    <div>
      <PageHeader
        title="Expiry Management"
        description="Track expiry dates, alert within 30 days, and prefer FEFO (first expired, first out)."
      />

      <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        FEFO: sell older / sooner-to-expire stock first. UI flag only — shipping blocks are mock.
      </div>

      {alerts.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-950">Expires in 30 days</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-950">
            {alerts.map((a) => (
              <li key={a.id}>
                <span className="font-semibold">{a.skuName}</span> · Qty {a.qtyOnHand} · Expiry{' '}
                {a.expiresAt} ({a.days}d)
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {batchesQ.isLoading ? <LoadingPanel label="Loading expiry…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Days left</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Ship?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.skuName}</div>
                    <div className="font-mono text-xs text-slate-500">{r.sku}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.batchCode}</td>
                  <td className="px-4 py-3 text-xs">{r.expiresAt}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-xs font-bold',
                        r.days < 0 && 'bg-rose-100 text-rose-900',
                        r.days >= 0 && r.days <= 30 && 'bg-amber-100 text-amber-900',
                        r.days > 30 && 'bg-emerald-50 text-emerald-800'
                      )}
                    >
                      {r.days < 0 ? 'Expired' : `${r.days}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{r.qtyOnHand}</td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    {r.days < 0 ? 'Blocked' : 'Allowed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Link to="/inventory/batch-lot" className="mt-3 inline-block text-xs font-semibold text-sky-700 hover:underline">
        Open Batch / Lot →
      </Link>
    </div>
  )
}
